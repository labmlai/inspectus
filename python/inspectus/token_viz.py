from typing import Optional
from inspectus.utils import init_inline_viz
import numpy as np

def visualize_tokens(tokens: list[str], values: dict[str, list[float]], token_info: Optional[list[str]] = None,
                         remove_padding: bool = True, color: str = "blue"):
  for value_list in values.values():
    if len(value_list) != len(tokens):
      raise ValueError("All value lists must have the same length as the tokens list")
  
  if token_info is not None and len(token_info) != len(tokens):
    raise ValueError("token_info must have the same length as the tokens list")
  
  if token_info is None:
    token_info = [{} for _ in range(len(tokens))]

  value_names = list(values.keys())
  value_names.sort()

  values = np.stack([values[name] for name in value_names])
  
  normalized_values = (values - np.min(values, axis=1, keepdims=True)) / (np.max(values, axis=1, keepdims=True) - np.min(values, axis=1, keepdims=True))

  from uuid import uuid1
  import json

  elem_id = 'id_' + uuid1().hex

  html = f'<div id="{elem_id}"></div>'

  script = f'<script>window.tokenViz(\'{elem_id}\',{json.dumps(tokens)}, {json.dumps(values.tolist())}, {json.dumps(normalized_values.tolist())}, {json.dumps(value_names)}, {json.dumps(remove_padding)}, {json.dumps(color)}, {json.dumps(token_info)})</script>'

  from IPython.display import display, HTML
  init_inline_viz()
  display(HTML(html + script))

  