import os
import re

html_dir = 'src/main/resources/static'
widget_code = """
<!-- Google Translate Widget -->
<div id="google_translate_element" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background-color: rgba(255,255,255,0.9); border-radius: 8px; padding: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
<script type="text/javascript">
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
}
</script>
<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
"""

count = 0
for filename in os.listdir(html_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(html_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Clean corrupted bottom completely
        # Find the LAST </body> tag or anything that looks like it
        match = re.search(r'</body[^>]*>', content, flags=re.IGNORECASE)
        if match:
            # Everything before the very first occurrence of </body> or corrupted tag
            clean_top = content[:match.start()]
            
            # Now reconstruct the clean footer
            new_content = clean_top + widget_code + "\n</body>\n</html>\n"
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f'Cleaned and injected into {filename}')

print(f'Successfully repaired {count} HTML files.')
