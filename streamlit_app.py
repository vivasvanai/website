import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Vivasvan AI — Chemical Engineer & AI Enthusiast", layout="wide")

st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {
        padding: 0rem !important;
        max-width: 100% !important;
    }
    iframe {
        width: 100% !important;
    }
</style>
""", unsafe_allow_html=True)

def get_file_content(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return f.read()

# Load HTML, CSS, JS
html_content = get_file_content("index.html")
css_content = get_file_content("style.css")
js_content = get_file_content("script.js")

# Inject CSS and JS directly into the HTML
html_content = html_content.replace('<link rel="stylesheet" href="style.css" />', f'<style>{css_content}</style>')
html_content = html_content.replace('<script src="script.js"></script>', f'<script>{js_content}</script>')

# Display it in Streamlit
components.html(html_content, height=3500, scrolling=False)
