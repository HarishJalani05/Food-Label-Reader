from icrawler.builtin import GoogleImageCrawler, BingImageCrawler
from PIL import Image
import os, random, shutil

foods = [
    "Vada Pav",
    "Pav Bhaji",
    "Samosa",
    "Dhokla",
    "Idli Wada",
    "Aloo Paratha",
    "Kachori",
    "Pani Puri",
    "Steam Momos",
    "Vegetable Sandwich"
]

root_dir = "dataset"
train_dir = os.path.join(root_dir, "train")
test_dir = os.path.join(root_dir, "test")
os.makedirs(train_dir, exist_ok=True)
os.makedirs(test_dir, exist_ok=True)

def download_images(food, limit=100):
    folder_name = food.replace(" ", "_").lower()
    dest_path = os.path.join(train_dir, folder_name)
    os.makedirs(dest_path, exist_ok=True)

    if len(os.listdir(dest_path)) > 40:
        print(f"✅ Skipping {food}: Already has {len(os.listdir(dest_path))} images.")
        return

    print(f"\n📸 Downloading {food} images...")
    google_success = False

    try:
        google_crawler = GoogleImageCrawler(storage={'root_dir': dest_path})
        google_crawler.crawl(keyword=food, max_num=limit, min_size=(128,128))
        google_success = True
    except Exception as e:
        print(f"⚠️ Google failed for {food}: {e}")

    if not google_success or len(os.listdir(dest_path)) < 30:
        print(f"🌐 Trying Bing for {food}...")
        try:
            bing_crawler = BingImageCrawler(storage={'root_dir': dest_path})
            bing_crawler.crawl(keyword=food, max_num=limit, min_size=(128,128))
        except Exception as e:
            print(f"❌ Bing also failed for {food}: {e}")

# Download all
for food in foods:
    download_images(food)

print("\n✅ Download complete. Organizing dataset...")

# Split train/test
for food in foods:
    folder = food.replace(" ", "_").lower()
    src = os.path.join(train_dir, folder)
    dst = os.path.join(test_dir, folder)
    os.makedirs(dst, exist_ok=True)
    if not os.path.exists(src): continue

    imgs = [f for f in os.listdir(src) if f.endswith(('.jpg', '.png', '.jpeg'))]
    random.shuffle(imgs)
    test_imgs = imgs[int(0.8*len(imgs)):]
    for img in test_imgs:
        shutil.copy(os.path.join(src, img), os.path.join(dst, img))

print("✅ Dataset split: 80% train / 20% test.")

# Resize
def resize_images(folder):
    for root, _, files in os.walk(folder):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                path = os.path.join(root, file)
                try:
                    img = Image.open(path).convert("RGB")
                    img = img.resize((224,224))
                    img.save(path, "JPEG")
                except Exception as e:
                    print(f"⚠️ Skipped {path}: {e}")

print("🧩 Resizing all images to 224×224...")
resize_images(root_dir)
print("✅ All images resized successfully!")
print("\n🎉 Dataset ready at: dataset/train and dataset/test")