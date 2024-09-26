from inspectus.utils import init_inline_viz

def visalize_token_loss(tokens: list[str], losses: list[float]):
  from uuid import uuid1
  import json

  elem_id = 'id_' + uuid1().hex

  html = f'<div id="{elem_id}"></div>'

  script = f'<script>window.tokenViz(\'{elem_id}\',{json.dumps(tokens)}, {json.dumps(losses)})</script>'

  from IPython.display import display, HTML
  init_inline_viz()
  display(HTML(html + script))

  