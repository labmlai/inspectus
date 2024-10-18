from typing import Optional, List, Dict
from inspectus.utils import init_inline_viz
import numpy as np


def visualize_tokens(
    tokens: List[str],
    values: Dict[str, List[float]],
    token_info: Optional[List[str]],
    remove_padding: bool,
    colors: Dict[str, str],
    theme: str,
):
    if token_info is None:
        token_info = ["" for _ in range(len(tokens))]

    value_names = list(values.keys())
    
    colors = [colors[name] for name in value_names]

    values = np.stack([values[name] for name in value_names])

    normalized_values = (values - np.min(values, axis=1, keepdims=True)) / (
        np.max(values, axis=1, keepdims=True) - np.min(values, axis=1, keepdims=True)
    )

    from uuid import uuid1
    import json

    elem_id = "id_" + uuid1().hex

    html = f'<div id="{elem_id}"></div>'

    script = f"<script>window.tokenViz('{elem_id}',{json.dumps(tokens)}, {json.dumps(values.tolist())}, {json.dumps(normalized_values.tolist())}, {json.dumps(value_names)}, {json.dumps(remove_padding)}, {json.dumps(colors)}, {json.dumps(token_info)}, {json.dumps(theme)})</script>"

    from IPython.display import display, HTML

    init_inline_viz()
    display(HTML(html + script))
