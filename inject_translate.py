import os

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
</body>
"""

count = 0
for filename in os.listdir(html_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(html_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'google_translate_element' not in content:
            # We want to replace the LAST </body> occurrence. 
            parts = content.rsplit('</body>', 1)
            
            if len(parts) == 2:
                new_content = parts[0] + widget_code + parts[1]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                print(f'Injected widget into {filename}')
            else:
                # If no </body> was found, append it
                with open(filepath, 'a', encoding='utf-8') as f:
                    f.write(widget_code)
                print(f'Appended widget into {filename}')

print(f'Successfully updated {count} HTML files.')
