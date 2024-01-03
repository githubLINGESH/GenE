
from transformers import GPT2LMHeadModel, GPT2Tokenizer

# Load the pre-trained GPT-2 model and tokenizer
model_name = "gpt2"  # You can use other GPT-2 variants if needed
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)


# Function to clean and generate text
def generate_text(
    prompt,
    max_length=100,
    top_k=50,
    top_p=0.95,
    num_return_sequences=1  # Use 1 for greedy search
):
    input_ids = tokenizer.encode(prompt, return_tensors="pt")

    # Generate text
    outputs = model.generate(
        input_ids,
        max_length=max_length,
        no_repeat_ngram_size=2,
        top_k=top_k,
        top_p=top_p,
        num_return_sequences=num_return_sequences
    )

    generated_texts = [tokenizer.decode(output, skip_special_tokens=True)
                       for output in outputs]
    return generated_texts


# Function to clean text for HTTP header
def clean_text_for_http(text):
    # Remove problematic characters
    cleaned_text = text.replace('\n', ' ').replace('\r', '').replace('\t', ' ')
    return cleaned_text


# Example usage
prompt = "Explain the concept of photosynthesis."
generated_texts = generate_text(prompt, max_length=100, num_return_sequences=1)

# Pass the generated text to the TTS server
if generated_texts:
    generated_text = clean_text_for_http(generated_texts[0])
    # Clean the generated text
    from tts_model import generate_audio_with_server
    # Import the function from the TTS script
    generate_audio_with_server(generated_text, output_path="output.wav")
