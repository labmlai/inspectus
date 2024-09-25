from typing import Callable
import numpy as np
from inspectus.utils import init_inline_viz
def visalize_token_loss(logits: np.ndarray, token_ids: np.ndarray, tokens: list[str], loss_fn: Callable):
  losses = [loss_fn(logits[i].reshape(1, -1), token_ids[i+1].reshape(1)) for i in range(len(token_ids)-1)]
  tokens = tokens[1:]

  from uuid import uuid1
  import json

  elem_id = 'id_' + uuid1().hex

  html = f'<div id="{elem_id}"></div>'

  script = f'<script>window.tokenViz(\'{elem_id}\',{json.dumps(tokens)}, {json.dumps(losses)})</script>'

  from IPython.display import display, HTML
  init_inline_viz()
  display(HTML(html + script))

  