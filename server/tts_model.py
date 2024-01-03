import requests

# The URL of the TTS server (update this with the server's actual URL)
TTS_SERVER_URL = 'http://[::1]:5002/api/tts'


# Function to generate audio from text and save it using the TTS server
def generate_audio_with_server(text, output_path="output.wav"):
    response = requests.get(TTS_SERVER_URL, headers={"text": text})
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f'Audio saved to {output_path}')
    else:
        print(f'Error generating audio: {response.status_code}')


# Example usage
text = "Lingeshwaran is the greatest of all time"
generate_audio_with_server(text, output_path="output.wav")
