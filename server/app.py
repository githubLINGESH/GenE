import os
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from pymongo import MongoClient
from tensorflow.keras import layers

# MongoDB configuration
mongo_client = MongoClient("mongodb+srv://linga2522004:bMAgre9xvbppIapO@clustergen.xewkcgr.mongodb.net/?retryWrites=true&w=majority")

# GAN configuration
latent_dim = 100
num_examples_to_generate = 10
num_avatars = 3
epochs = 5
batch_size = 32

# Create generator model
def build_generator(latent_dim):
    model = tf.keras.Sequential()
    model.add(layers.Dense(7 * 7 * 512, use_bias=False, input_shape=(latent_dim,)))
    model.add(layers.BatchNormalization())
    model.add(layers.LeakyReLU())

    model.add(layers.Reshape((7, 7, 512)))
    model.add(layers.Conv2DTranspose(256, (5, 5), strides=(1, 1), padding="same", use_bias=False))
    model.add(layers.BatchNormalization())
    model.add(layers.LeakyReLU())

    model.add(layers.Conv2DTranspose(128, (5, 5), strides=(2, 2), padding="same", use_bias=False))
    model.add(layers.BatchNormalization())
    model.add(layers.LeakyReLU())

    model.add(layers.Conv2DTranspose(64, (5, 5), strides=(2, 2), padding="same", use_bias=False))
    model.add(layers.BatchNormalization())
    model.add(layers.LeakyReLU())

    model.add(layers.Conv2DTranspose(3, (5, 5), strides=(2, 2), padding="same", use_bias=False, activation="tanh"))
    
    model.add(layers.Dropout(0.3))
    return model


# Generate images and store in MongoDB
def generate_and_store_images(model, epoch, test_input, num_examples_to_generate, avatar_id):
    predictions = model(test_input, training=False)

    for i in range(num_examples_to_generate):
        image_data = predictions[i].numpy()
        # Normalize image data
        image_data = (image_data + 1) / 2.0  # Rescale values to [0, 1]
        image_data = (image_data * 255).astype(np.uint8)

        # Convert to BSON binary format for MongoDB
        image_bson = tf.io.encode_png(image_data).numpy()

        # Insert metadata and image binary data into MongoDB
        image_metadata = {"avatar_id": avatar_id, "epoch": epoch, "image_data": image_bson}
        collection = mongo_client["Avatars"]["Images_Avatar_" + str(avatar_id)]
        collection.insert_one(image_metadata)
        
def generate_and_store_images_locally(model, epoch, test_input, num_examples_to_generate, avatar_id, output_dir="output_images"):
    predictions = model(test_input, training=False)

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    for i in range(num_examples_to_generate):
        image_data = predictions[i].numpy()
        # Normalize image data
        image_data = (image_data + 1) / 2.0

        # Save the generated image locally
        image_filename = f"avatar_{avatar_id}_epoch_{epoch}_image_{i}.png"
        image_path = os.path.join(output_dir, image_filename)
        plt.imsave(image_path, image_data)

        print(f"Saved generated image for Avatar {avatar_id}, Epoch {epoch}, Image {i} to: {image_path}")

# Train the GAN
def train_gan(dataset, epochs, batch_size):
    generator = build_generator(latent_dim)
    generator.compile(loss='binary_crossentropy', optimizer='adam')

    for epoch in range(epochs):
        for avatar_id in range(num_avatars):
            for i, image_path in enumerate(dataset[avatar_id]):
                # Preprocess and load the image
                try:
                    output_dir = 'outputs'
                    img = tf.io.read_file(image_path)
                    original_image_path = os.path.join(output_dir, f"original_avatar_{avatar_id}_epoch_{epoch}_image_{i}.png")
                    tf.io.write_file(original_image_path, img)

                    img = tf.image.decode_image(img, channels=3, dtype=tf.uint8)
                    img = tf.image.convert_image_dtype(img, tf.float32)
                    img = tf.image.resize(img, (64, 64))
                    img = img * 2.0 - 1.0
                    img = tf.expand_dims(img, 0)
                except tf.errors.NotFoundError:
                    print(f"File not found: {image_path}")
                    continue
                except tf.errors.InvalidArgumentError as e:
                    print(f"Error decoding image: {str(e)}")
                    continue
                

                # Display the original image
                plt.figure(figsize=(8, 4))
                plt.subplot(1, 2, 1)
                plt.imshow((img.numpy().squeeze() + 1) / 2.0)
                plt.title("Original Image")

                # Train the generator
                noise = tf.random.normal([num_examples_to_generate, latent_dim])
                generated_images = generator.predict(noise, batch_size=num_examples_to_generate)

                # Display the generated image
                plt.subplot(1, 2, 2)
                plt.imshow((generated_images[i].squeeze() + 1) / 2.0)
                plt.title("Generated Image")

                plt.show()

                # Store generated images in MongoDB
                try:
                    generate_and_store_images(generator, epoch, noise, num_examples_to_generate, avatar_id)
                    generate_and_store_images_locally(generator, epoch, noise, num_examples_to_generate, avatar_id)
                except Exception as e:
                    print(f"Error generating and storing images: {str(e)}")
                    continue
                
            sample_noise = tf.random.normal([1, latent_dim])
            generate_and_store_images_locally(generator, epoch, sample_noise, 1, avatar_id)



# Replace this with the path to your organized dataset
dataset = {
    0: [os.path.join("data", "man1", "dhoni.png"), os.path.join("data", "man1", "dhoni1.png"), os.path.join("data", "man1", "dhoni2.png")],
    1: [os.path.join("data", "man2", "kohli.png"), os.path.join("data", "man2", "kohli1.png"), os.path.join("data", "man2", "kohli2.png")],
    2: [os.path.join("data", "women1", "smirt.png"), os.path.join("data", "women1", "smitr1.png"), os.path.join("data", "women1", "smrith3.png")],
}

# Train the GAN
train_gan(dataset, epochs, batch_size)
