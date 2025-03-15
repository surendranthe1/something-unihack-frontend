# Note: Replace **<YOUR_APPLICATION_TOKEN>** with your actual Application token
import os
import requests
import json
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

BASE_API_URL = "https://api.langflow.astra.datastax.com"
LANGFLOW_ID = "5aea908a-ce11-4bc3-9c51-d535da13fd06"
FLOW_ID = "d34c36b7-8e3d-4943-a767-5aa605e33a77"
APPLICATION_TOKEN = os.environ.get("APP_TOKEN")
ENDPOINT = "customer" # The endpoint name of the flow


def run_flow(message: str) -> dict:
    api_url = f"{BASE_API_URL}/lf/{LANGFLOW_ID}/api/v1/run/{ENDPOINT}"

    payload = {
        "input_value": message,
        "output_type": "chat",
        "input_type": "chat",
    }

    headers = {"Authorization": "Bearer " + APPLICATION_TOKEN, "Content-Type": "application/json"}
    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()

def main():
    st.title("Chat Interface")

    message = st.text_area("Message", placeholder="What Skill would you like to learn?")

    if st.button("Run Axom"):
        if not message.strip():
            st.error("Please enter a message")
            return
        
        try:
            with st.spinner("Running Model"):
                response = run_flow(message)

            response = response["outputs"][0]["outputs"][0]["results"]["message"]["text"]
            st.markdown(response)
        except Exception as e:
            st.error(str(e))

if __name__ == "__main__":
    main()