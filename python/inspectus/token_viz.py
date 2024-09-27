from typing import Optional
from inspectus.utils import init_inline_viz
import numpy as np

def visualize_token_loss(tokens: list[str], values: np.ndarray, value_names: Optional[list[str]] = None, remove_padding: bool = True):
  if isinstance(values, list):
      values = np.array(values)
  
  if len(values.shape)  > 2:
    raise ValueError("Only 1D or 2D arrays are supported")
  if len(values.shape) == 2:
    if value_names is not None and values.shape[0] != len(value_names):
      raise ValueError("value_names length must match the number of values in dim 0")
    
  if len(values.shape) == 1:
    values = values.reshape(1, -1)
    
  if value_names is None:
    value_names = [f"Value {i}" for i in range(values.shape[0])]

  if len(set(value_names)) < len(value_names):
      raise ValueError("Duplicate names found in value_names")

  normalized_values = (values - np.min(values, axis=1, keepdims=True)) / (np.max(values, axis=1, keepdims=True) - np.min(values, axis=1, keepdims=True))

  from uuid import uuid1
  import json

  elem_id = 'id_' + uuid1().hex

  html = f'<div id="{elem_id}"></div>'

  script = f'<script>window.tokenViz(\'{elem_id}\',{json.dumps(tokens)}, {json.dumps(values.tolist())}, {json.dumps(normalized_values.tolist())}, {json.dumps(value_names)}, {json.dumps(remove_padding)})</script>'

  from IPython.display import display, HTML
  init_inline_viz()
  display(HTML(html + script))

  