from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import requests

app = Flask(__name__)
CORS(app)

# OpenAI API Key
api_key = "sk-gHtb9Sru2TDKIiC89hjtGnMIA56o6y7Ka2YDW95xNAT3BlbkFJiNSJ2vgHT1tT3KFlocme0Oe5UEYz5OJ-0IHdjbnBkA"

def analyze_image(base64_image):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    input_text = (
        
        "Discribe the image in 3 lines ?\n"
    )

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": input_text
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 500
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    return response.json()

def extract_answers(response):
    # Assuming the response is structured as a single block of text with answers separated by newlines
    content = response['choices'][0]['message']['content']
    
    # Splitting the content into individual answers
    answers = content.strip().split('\n')

    # Mapping answers to respective questions
    answer_mapping = {
        "question_1": answers[0] if len(answers) > 0 else "Answer not found"
    }

    return answer_mapping

@app.route('/upload', methods=['POST'])
def upload_image():
    print("from server: ")
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['image']
    file_content = file.read()
    base64_image = base64.b64encode(file_content).decode('utf-8')

    # print(file)
    # print(request)
    # data = request.json
    # base64_image = file;# data['image']
    result = analyze_image(base64_image)

    # Extracting and mapping answers
    answers = extract_answers(result)
    
    # Return the extracted answers as a JSON response with each answer as a separate point
    return jsonify({
        "tree_species": answers["question_1"]
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)
