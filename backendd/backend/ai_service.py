# Calls the OpenAI API. The model may only use the policy excerpts we give it.

import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def is_ai_configured():
    key = os.getenv("OPENAI_API_KEY")
    return key is not None and key != ""


def get_ai_analysis(case_text, policy_chunks, missing_fields):
    client = OpenAI()  # reads OPENAI_API_KEY automatically

    policy_text = ""
    for chunk in policy_chunks:
        policy_text += "[" + chunk["source"] + "] " + chunk["text"] + "\n\n"

    system_message = (
        "You are a quality assurance assistant. Use ONLY the policy excerpts provided as evidence. "
        "Reply with JSON containing: reasons (list of strings), "
        "missing_information (list of strings), recommended_action (string)."
    )
    user_message = (
        "POLICY EXCERPTS:\n" + policy_text +
        "\nFIELDS NOT FOUND BY OUR CHECK: " + ", ".join(missing_fields) +
        "\n\nCASE DOCUMENT:\n" + case_text[:6000]
    )

    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
