JS_CSS_ADDED = False


def init_inline_viz():
    html = ''

    global JS_CSS_ADDED

    if not JS_CSS_ADDED:
        html += '''<script src="https://cdn.statically.io/gist/lakshith-403/6c40cc4e37d07676f421108d9d0109a6/raw/3570ac6da38a5d7250c6b6aee3e18bcf70b71d0f/labml_attn.js"></script>'''
        html += '''<link rel="stylesheet" href="https://cdn.statically.io/gist/lakshith-403/81b16b30a7f2c853a536f3d3975a7693/raw/aaee9494e96c5370b27821e114562d2d8e64ce39/labml_attn.css">'''
        JS_CSS_ADDED = True

    from IPython.display import display, HTML

    display(HTML(html))


def text_attention():
    html = ''

    from uuid import uuid1
    elem_id = 'id_' + uuid1().hex

    html += f'<div id="{elem_id}"></div>'

    script = ''
    script += '<script>'
    script += f"window.chartsEmbed('{elem_id}')"
    script += '</script>'

    from IPython.display import display, HTML

    display(HTML(html))
    display(HTML(script))
