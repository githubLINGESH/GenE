import os
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from pymongo import MongoClient
from tensorflow.keras import layers
import datetime

# MongoDB configuration
mongo_client = MongoClient("mongodb+srv://linga2522004:bMAgre9xvbppIapO@clustergen.xewkcgr.mongodb.net/?retryWrites=true&w=majority")

# GAN configuration
latent_dim = 100
num_examples_to_generate = 5
num_avatars = 3
epochs = 300
batch_size = 32

# Create generator model
def build_generator(latent_dim):
    model = tf.keras.Sequential()
    model.add(layers.Dense(8 * 8 * 256, use_bias=False, input_shape=(latent_dim,)))
    model.add(layers.BatchNormalization())
    model.add(layers.LeakyReLU())

    model.add(layers.Reshape((8, 8, 256)))
    model.add(layers.Conv2DTranspose(128, (5, 5), strides=(1, 1), padding="same", use_bias=False))
    model.add(layers.BatchNormalization())
    model.add(layers.LeakyReLU())

    model.add(layers.Conv2DTranspose(64, (5, 5), strides=(2, 2), padding="same", use_bias=False))
    model.add(layers.BatchNormalization())
    model.add(layers.LeakyReLU())

    model.add(layers.Conv2DTranspose(32, (5, 5), strides=(2, 2), padding="same", use_bias=False))
    model.add(layers.BatchNormalization())
    model.add(layers.LeakyReLU())

    model.add(layers.Conv2DTranspose(3, (5, 5), strides=(2, 2), padding="same", use_bias=False, activation="tanh"))
    return model

# Create discriminator model
def build_discriminator():
    model = tf.keras.Sequential()
    model.add(layers.Conv2D(64, (5, 5), strides=(2, 2), padding="same", input_shape=[64, 64, 3]))
    model.add(layers.LeakyReLU())
    model.add(layers.Dropout(0.3))

    model.add(layers.Conv2D(128, (5, 5), strides=(2, 2), padding="same"))
    model.add(layers.LeakyReLU())
    model.add(layers.Dropout(0.3))

    model.add(layers.Flatten())
    model.add(layers.Dense(1))

    return model

# Create GAN
def build_gan(generator, discriminator):
    discriminator.trainable = False
    model = tf.keras.Sequential([generator, discriminator])
    return model


# Loss functions
cross_entropy = tf.keras.losses.BinaryCrossentropy(from_logits=True)

# Discriminator loss
def discriminator_loss(real_output, fake_output):
    real_loss = cross_entropy(tf.ones_like(real_output), real_output)
    fake_loss = cross_entropy(tf.zeros_like(fake_output), fake_output)
    total_loss = real_loss + fake_loss
    return total_loss

# Generator loss
def generator_loss(fake_output):
    return cross_entropy(tf.ones_like(fake_output), fake_output)

# Optimizers
generator_optimizer = tf.keras.optimizers.Adam(1e-4, beta_1=0.5)
discriminator_optimizer = tf.keras.optimizers.Adam(2e-4, beta_1=0.5)

# Build and compile the generator and discriminator
generator = build_generator(latent_dim)
discriminator = build_discriminator()

# Create the GAN
gan = build_gan(generator, discriminator)

# Training function
def train_gan(dataset, epochs, batch_size):
    for epoch in range(epochs):
        epoch_gen_loss = []
        epoch_disc_loss = []
        for image_batch in dataset:
            noise = tf.random.normal([batch_size, latent_dim])

            # Train the discriminator
            with tf.GradientTape() as disc_tape:
                generated_images = generator(noise, training=False)
                real_output = discriminator(image_batch, training=True)
                fake_output = discriminator(generated_images, training=True)
                disc_loss = discriminator_loss(real_output, fake_output)

            gradients_of_discriminator = disc_tape.gradient(disc_loss, discriminator.trainable_variables)
            discriminator_optimizer.apply_gradients(zip(gradients_of_discriminator, discriminator.trainable_variables))

            # Train the generator
            with tf.GradientTape() as gen_tape:
                generated_images = generator(noise, training=True)
                fake_output = discriminator(generated_images, training=True)
                gen_loss = generator_loss(fake_output)

            gradients_of_generator = gen_tape.gradient(gen_loss, generator.trainable_variables)
            generator_optimizer.apply_gradients(zip(gradients_of_generator, generator.trainable_variables))

            # Append the losses to track them over time
            epoch_gen_loss.append(gen_loss)
            epoch_disc_loss.append(disc_loss)

        # After each epoch, print average losses and save images
        print(f'Epoch {epoch + 1}/{epochs} - Generator Loss: {np.mean(epoch_gen_loss)}, Discriminator Loss: {np.mean(epoch_disc_loss)}')
        
        save_image(epoch)

def save_image(epoch):
    # Generate a batch of images
    noise = tf.random.normal([num_examples_to_generate, latent_dim])
    generated_images = generator(noise, training=False)

    # Save images to disk
    for i in range(num_examples_to_generate):
        img = (generated_images[i, :, :, :] * 0.5 + 0.5).numpy()
        img = (img * 255).astype(np.uint8)
        img_path = f'images/epoch_{epoch}_image_{i}.png'
        tf.io.write_file(img_path, tf.image.encode_png(img))
            


def save_images(real_images, generated_images, epoch, batch_counter):
    
    # Create a directory to save the images if it doesn't exist
    save_dir = 'saved_images'
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # Save real image
    real_image_path = os.path.join(save_dir, f'real_image_epoch_{epoch}_batch_{batch_counter}.png')
    plt.imsave(real_image_path, (real_images[0].numpy() * 0.5 + 0.5).astype(np.uint8))

    # Save generated image
    generated_image_path = os.path.join(save_dir, f'generated_image_epoch_{epoch}_batch_{batch_counter}.png')
    plt.imsave(generated_image_path, (generated_images[0].numpy() * 0.5 + 0.5).astype(np.uint8))

    


def display_images(real_images, generated_images):
    plt.figure(figsize=(10, 5))
    plt.subplot(1, 2, 1)
    plt.imshow((real_images[0] * 0.5 + 0.5))
    plt.title("Real Image")
    plt.axis('off')

    plt.subplot(1, 2, 2)
    plt.imshow((generated_images[0] * 0.5 + 0.5))
    plt.title("Generated Image")
    plt.axis('off')
    plt.show()

def store_images(generated_images, epoch):
    for i, image in enumerate(generated_images):
        image = ((image * 0.5 + 0.5) * 255).numpy().astype(np.uint8)
        image_bson = tf.io.encode_png(image).numpy()
        image_metadata = {"epoch": epoch, "image_data": image_bson}
        # Your MongoDB collection to store images
        collection = mongo_client["GAN_Images"]["Epoch_" + str(epoch)]
        collection.insert_one(image_metadata)
                

# Load and preprocess your dataset
def load_data():
    # Your code to load and preprocess the dataset
    return dataset

# Assuming your dataset is a list of file paths:
def preprocess_image(image_path):
    img_raw = tf.io.read_file(image_path)
    # Try-catch block to handle different file formats
    try:
        img = tf.image.decode_jpeg(img_raw, channels=3)
    except tf.errors.InvalidArgumentError:
        try:
            img = tf.image.decode_png(img_raw, channels=3)
        except tf.errors.InvalidArgumentError:
            raise Exception(f"Unsupported image format for file {image_path}")
    
    img = tf.image.resize(img, [64, 64])
    img = (img - 127.5) / 127.5  # Normalize to [-1, 1]
    return img



def prepare_dataset(paths):
    all_paths = []
    for avatar_id, avatar_paths in paths.items():
        all_paths.extend(avatar_paths)  # Combine all paths into a single list
    dataset = tf.data.Dataset.from_tensor_slices(all_paths)
    dataset = dataset.map(preprocess_image).batch(batch_size)
    return dataset

def validate_images(paths):
    for path in paths:
        try:
            with open(path, 'rb') as f:
                contents = f.read()
                try:
                    img = tf.image.decode_jpeg(contents, channels=3)
                except tf.errors.InvalidArgumentError:
                    try:
                        img = tf.image.decode_png(contents, channels=3)
                    except tf.errors.InvalidArgumentError:
                        try:
                            img = tf.image.decode_gif(contents)
                        except tf.errors.InvalidArgumentError:
                            try:
                                img = tf.image.decode_bmp(contents)
                            except tf.errors.InvalidArgumentError:
                                raise Exception(f"Unsupported image format for file {path}")
        except Exception as e:
            print(f"Error processing image: {path}")
            raise e



# Paths to your images
paths = {
    0: [os.path.join("data", "man1", "dhoni.png"), os.path.join("data", "man1", "dhoni1.png"), os.path.join("data", "man1", "dhoni2.png")],
    1: [os.path.join("data", "man2", "kohli.png"), os.path.join("data", "man2", "kohli1.png"), os.path.join("data", "man2", "kohli2.png")],
    2: [os.path.join("data", "women1", "smrith.png"), os.path.join("data", "women1", "smrith1.png"), os.path.join("data", "women1", "smrith2.png")],
}

# Use this function to validate all images before training
all_paths = [path for sublist in paths.values() for path in sublist]
validate_images(all_paths)

dataset = prepare_dataset(paths)
train_gan(dataset, epochs, batch_size)


