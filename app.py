from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import pytesseract
from PIL import Image
import cv2
import os
import requests
import base64
import numpy as np
import pandas as pd
from io import BytesIO
from tensorflow.keras.models import load_model
# Note: img_to_array and load_img not needed - using PIL and numpy directly
from datetime import datetime
import csv

app = Flask(__name__)
CORS(app)

# ==================== ⚙️ Load Data and Model ====================

# Load your trained model
MODEL_PATH = "food_model_finetuned.h5"
try:
    model = load_model(MODEL_PATH)
    print("✅ Loaded trained model successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Class names (same order as dataset folders used in training)
class_names = [
    "Pav Bhaji",
    "Vada Pav",
    "Samosa",
    "Dhokla",
    "Idli Wada",
    "Aloo Paratha",
    "Kachori",
    "Pani Puri",
    "Steam Momos",
    "Vegetable Sandwich"
]

# Load Indian food info CSV if available
FOOD_CSV = "indian_food_info.csv"
food_df = pd.read_csv(FOOD_CSV).set_index("food_key") if os.path.exists(FOOD_CSV) else None
if food_df is not None:
    print("✅ Loaded nutrition data from indian_food_info.csv")

# ==================== 🧠 Helper Functions ====================

def evaluate_ingredients(text):
    text = text.lower().strip()

    harmful_words = [
        "sugar", "salt", "refined", "oil", "palm", "flavor", "preservative",
        "color", "acid", "benzoate", "fructose", "msg", "artificial",
        "hydrogenated", "maida", "corn syrup", "sweetener", "margarine",
        "glucose", "starch", "sodium", "stabilizer"
    ]
    good_words = [
        "fiber", "protein", "vitamin", "mineral", "whole grain", "natural",
        "honey", "oats", "seeds", "nuts", "fruit", "vegetable",
        "olive oil", "yogurt", "herb", "plant-based"
    ]

    harmful = [w for w in harmful_words if w in text]
    good = [w for w in good_words if w in text]

    harmful_penalty = len(harmful) * 12
    good_bonus = len(good) * 4
    balance_factor = (len(good) + 0.5) / (len(good) + len(harmful) + 1)
    score = int(90 * balance_factor - harmful_penalty * 0.7 + good_bonus)
    score = max(20, min(100, score))

    if score >= 85:
        rating = "Excellent 🥗"
    elif score >= 70:
        rating = "Healthy 🥦"
    elif score >= 50:
        rating = "Moderate 🍪"
    elif score >= 30:
        rating = "Unhealthy 🍔"
    else:
        rating = "Very Unhealthy ⚠️"

    substitutes = []
    if "sugar" in text:
        substitutes.append("Use Stevia or Honey instead of Sugar")
    if "salt" in text:
        substitutes.append("Use Low-Sodium Salt or Herbs instead")
    if "oil" in text or "refined" in text:
        substitutes.append("Use Olive or Sunflower Oil instead")
    if "maida" in text:
        substitutes.append("Use Whole Wheat Flour instead of Maida")

    return {
        "score": score,
        "rating": rating,
        "harmful": harmful,
        "good": good,
        "substitutes": substitutes
    }

# ==================== 📸 Predict Food Route ====================

@app.route("/predict_food", methods=["POST"])
def predict_food():
    try:
        start_time = datetime.now()
        print(f"\n{'='*50}")
        print(f"🔍 New prediction request received at {start_time}")

        # Check if model is loaded
        if model is None:
            print("❌ Model is not loaded!")
            return jsonify({"error": "Model not loaded. Please check MODEL_PATH."}), 500

        if "image" not in request.files:
            print("❌ No image in request")
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        print(f"📁 File received: {file.filename}")
        
        if file.filename == '':
            print("❌ Empty filename")
            return jsonify({"error": "Empty filename"}), 400

        os.makedirs("static/uploads", exist_ok=True)
        filepath = os.path.join("static/uploads", file.filename)
        file.save(filepath)
        print(f"💾 File saved to: {filepath}")

        # ✅ Efficient image loading and preprocessing
        try:
            print("🖼️  Loading and preprocessing image...")
            with Image.open(filepath) as img:
                img = img.convert("RGB").resize((224, 224))
                img_array = np.asarray(img, dtype=np.float32) / 255.0
            print(f"✅ Image preprocessed: shape {img_array.shape}")
        except Exception as img_error:
            print(f"❌ Image processing error: {img_error}")
            return jsonify({"error": f"Invalid image file: {str(img_error)}"}), 400

        img_array = np.expand_dims(img_array, axis=0)

        # ✅ Predict using cached model
        print("🧠 Running model prediction...")
        preds = model.predict(img_array, verbose=0)
        idx = np.argmax(preds[0])
        food_name = class_names[idx]
        confidence = float(np.max(preds[0]))
        print(f"✅ Prediction: {food_name} (confidence: {confidence*100:.2f}%)")

        # ✅ Lookup ingredients & nutrition (CSV)
        ingredients = ""
        nutrition = {}
        if food_df is not None:
            key_like = food_name.lower().replace(" ", "_")
            print(f"🔍 Looking up nutrition data for key: {key_like}")
            if key_like in food_df.index:
                row = food_df.loc[key_like]
                ingredients = str(row.get("ingredients", ""))
                nutrition = {
                    "calories": int(row.get("calories", 0)),
                    "protein_g": float(row.get("protein_g", 0)),
                    "fat_g": float(row.get("fat_g", 0)),
                    "carbs_g": float(row.get("carbs_g", 0))
                }
                print(f"✅ Found nutrition data: {nutrition}")
            else:
                print(f"⚠️  No nutrition data found for {key_like}")
        else:
            print("⚠️  CSV file not loaded")

        # ✅ Evaluate ingredients quickly
        print("📊 Evaluating health score...")
        score_data = evaluate_ingredients(ingredients) if ingredients else {
            "score": 50,
            "rating": "Unknown",
            "harmful": [],
            "good": [],
            "substitutes": []
        }
        print(f"✅ Health score: {score_data['score']}/100 - {score_data['rating']}")

        # ✅ Logging detection time
        try:
            os.makedirs("logs", exist_ok=True)
            log_file = os.path.join("logs", "detection_log.csv")
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            log_data = [
                timestamp,
                food_name,
                round(confidence * 100, 2),
                file.filename,
                score_data.get("score", ""),
                score_data.get("rating", "")
            ]
            header = ["Timestamp", "Detected_Food", "Confidence(%)", "Image", "Health_Score", "Rating"]
            write_header = not os.path.exists(log_file)
            with open(log_file, "a", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                if write_header:
                    writer.writerow(header)
                writer.writerow(log_data)
            print(f"✅ Logged to {log_file}")
        except Exception as log_error:
            print(f"⚠️  Logging failed: {log_error}")

        # ✅ Compute and include total processing time
        elapsed = (datetime.now() - start_time).total_seconds()
        print(f"⏱️  Total processing time: {elapsed:.2f}s")

        response_data = {
            "food_name": food_name,
            "predicted_food": food_name,
            "confidence": confidence,
            "ingredients": ingredients,
            "nutrition": nutrition,
            "processing_time_sec": elapsed,
            **score_data
        }
        
        print(f"✅ Sending response")
        print(f"{'='*50}\n")
        return jsonify(response_data)

    except Exception as e:
        print(f"\n❌ ERROR in predict_food: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ==================== 🧾 OCR + Barcode Routes ====================

@app.route("/extract", methods=["POST"])
def extract_text():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        image = request.files["image"]
        os.makedirs("uploads", exist_ok=True)
        path = os.path.join("uploads", image.filename)
        image.save(path)

        img = cv2.imread(path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        gray = cv2.medianBlur(gray, 3)
        pil_img = Image.fromarray(gray)

        extracted_text = pytesseract.image_to_string(pil_img, lang="eng").strip()
        if not extracted_text:
            return jsonify({"error": "No text detected"}), 400

        result = evaluate_ingredients(extracted_text)
        return jsonify({"ingredients": extracted_text, **result})

    except Exception as e:
        return jsonify({"error": f"OCR failed: {str(e)}"}), 500


@app.route("/barcode", methods=["GET"])
def barcode_lookup():
    barcode = request.args.get("barcode")
    if not barcode:
        return jsonify({"error": "No barcode provided"}), 400

    url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if data.get("status") != 1:
            return jsonify({"error": "Product not found"}), 404

        product = data["product"]
        name = product.get("product_name", "Unknown Product")
        ingredients = product.get("ingredients_text", "")
        nutriments = product.get("nutriments", {})

        result = evaluate_ingredients(ingredients)
        return jsonify({
            "name": name,
            "ingredients": ingredients,
            "nutriments": nutriments,
            **result
        })

    except requests.exceptions.RequestException:
        return jsonify({"error": "Unable to reach OpenFoodFacts API."}), 504

@app.route("/evaluate", methods=["POST"])
def evaluate_text():
    data = request.get_json()
    text = data.get("ingredients", "")
    if not text:
        return jsonify({"error": "No ingredients provided"}), 400
    return jsonify(evaluate_ingredients(text))


@app.route("/")
def start_page():
    return render_template("start.html")


@app.route("/analyze-page")
def analyze_page():
    return render_template("index.html")


# 🔍 DEBUG ROUTE - Test to find correct class order
@app.route("/debug_predict", methods=["POST"])
def debug_predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
            
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        filepath = os.path.join("static/uploads", file.filename)
        os.makedirs("static/uploads", exist_ok=True)
        file.save(filepath)
        
        with Image.open(filepath) as img:
            img = img.convert("RGB").resize((224, 224))
            img_array = np.asarray(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        preds = model.predict(img_array, verbose=0)[0]
        
        # Find which index has MAX confidence (THIS IS THE KEY!)
        max_idx = int(np.argmax(preds))
        max_conf = float(preds[max_idx]) * 100
        
        print(f"\n{'='*60}")
        print(f"🔍 DEBUG MODE:")
        print(f"   File: {file.filename}")
        print(f"   RAW Model Output: Index {max_idx}")
        print(f"   Current Mapping: {class_names[max_idx]}")
        print(f"   Confidence: {max_conf:.2f}%")
        print(f"{'='*60}\n")
        
        # Show predictions in ORIGINAL index order
        results_original = []
        for i, (name, conf) in enumerate(zip(class_names, preds)):
            results_original.append({
                "index": i,
                "class_name": name,
                "confidence": round(float(conf) * 100, 2)
            })
        
        # Also show sorted by confidence
        results_sorted = sorted(results_original, key=lambda x: x['confidence'], reverse=True)
        
        response = {
            "filename": file.filename,
            "predicted_index": max_idx,
            "predicted_class": class_names[max_idx],
            "predicted_confidence": round(max_conf, 2),
            "all_predictions_sorted": results_sorted,
            "all_predictions_original_order": results_original,
            "top_3": results_sorted[:3]
        }
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        print(f"\n❌ DEBUG ERROR:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Running Food Label Reader — open http://127.0.0.1:5000")
    app.run(debug=True)