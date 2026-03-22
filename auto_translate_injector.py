import os
import re

html_dir = 'src/main/resources/static'

# The ugly old code to strip out
old_code_1 = """<!-- Google Translate Widget -->
<div id="google_translate_element" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background-color: rgba(255,255,255,0.9); border-radius: 8px; padding: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
<script type="text/javascript">
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
}
</script>
<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>"""

old_code_2 = """<div id="google_translate_element" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background-color: rgba(255,255,255,0.9); border-radius: 5px; padding: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
<script type="text/javascript">
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
}
</script>
<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>"""

# The invisible auto-translator (picks up the cookie automatically, but hides UI)
hidden_translator_code = """
<!-- Invisible Global Auto-Translator -->
<div id="google_translate_hidden" style="display:none;"></div>
<style>.skiptranslate iframe, .goog-te-banner-frame { display: none !important; } body { top: 0px !important; }</style>
<script type="text/javascript">
function googleTranslateElementInitHidden() {
  new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_hidden');
}
</script>
<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInitHidden"></script>
"""

count = 0
for filename in os.listdir(html_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(html_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Clean old bulky widgets (handle slight whitespace differences using simple replace)
        content = content.replace(old_code_1, "")
        content = content.replace(old_code_1 + '\n</body>', "\n</body>")
        content = content.replace(old_code_2, "")
        
        # Also clean up duplicate invisible auto-translators if script is run twice
        content = content.replace(hidden_translator_code, "")

        # ONLY inject the invisible translator into pages that are NOT the dashboard.
        # Dashboard has the bespoke UI.
        if filename != "dashboard.html":
            parts = content.rsplit('</body>', 1)
            if len(parts) == 2:
                new_content = parts[0] + hidden_translator_code + "\n</body>" + parts[1]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
            else:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
        else:
            # For dashboard just save it clean from the old junk
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print(f'Done! Successfully cleaned and auto-translated {count} pages.')
