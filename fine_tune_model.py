import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Load your existing model
model = load_model("food_model.h5")

# Unfreeze some deeper layers for fine-tuning
for layer in model.layers[-40:]:
    layer.trainable = True

# Recompile with a lower learning rate
model.compile(optimizer=Adam(learning_rate=1e-5),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Prepare the data again
train_gen = ImageDataGenerator(rescale=1./255)
test_gen = ImageDataGenerator(rescale=1./255)

train_data = train_gen.flow_from_directory('dataset/train', target_size=(224,224), batch_size=32, class_mode='categorical')
test_data = test_gen.flow_from_directory('dataset/test', target_size=(224,224), batch_size=32, class_mode='categorical')

# Train again (fine-tune)
model.fit(train_data, validation_data=test_data, epochs=5)

# Save the improved model
model.save("food_model_finetuned.h5")
print("✅ Fine-tuned model saved as food_model_finetuned.h5")

# Evaluate
loss, acc = model.evaluate(test_data)
print(f"✅ Fine-tuned Test Accuracy: {acc*100:.2f}%")