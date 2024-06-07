# Readme

Inspectus is a versatile visualization tool for large language models.
It runs smoothly in Jupyter notebooks via an easy-to-use Python API. Inspectus provides multiple views, offering diverse insights into language model behaviors.

## Preview

![Inspectus](Images/preview.gif)

## Components

### Attention Matrix
Visualizes the attention scores between tokens, highlighting how each token focuses on others during processing.

### Query Token Heatmap
Shows the sum of attention scores between each query and selected key tokens

### Key Token Heatmap
Shows the sum of attention scores between each key and selected query tokens

### Dimension Heatmap 
Shows the sum of attention scores for each item in dimensions (Layers and Heads) normalized over the dimension.

### Token Dimension Heatmap
For each key token, shows the sum of attention scores from query tokens in the selected dimension.

### Line Grid
Visualize attention scores between query and key tokens for all attention matrices.

## Getting Started

### Installation

```bash
pip install inspectus
```

### Usage

Import the library
```python
from inspectus import attention
```

Simple usage
```python
# attns: A list of attention maps for each layer
# tokens: A list of tokens
attention(attns, tokens)
```

For different source and target tokens
```python
# source_tokens: A list of source tokens
# target_tokens: A list of target tokens
attention(attns, source_tokens, target_tokens)
```

Select which views to display
```python
# views: A list of views to display
# Possible values: 'attention_matrix', 'query_token_heatmap', 'key_token_heatmap', 'dimension_heatmap', 'token_dim_heatmap', 'line_grid'
attention(attns, tokens, chart_types=['attention_matrix'])
```

## Tutorials

### Huggingface models

Following example uses a GPT2 Model from huggingface.

```python
from transformers import AutoTokenizer, GPT2LMHeadModel, AutoConfig
import torch
from inspectus import attention

context_length = 128
tokenizer = AutoTokenizer.from_pretrained("huggingface-course/code-search-net-tokenizer")

config = AutoConfig.from_pretrained(
    "gpt2",
    vocab_size=len(tokenizer),
    n_ctx=context_length,
    bos_token_id=tokenizer.bos_token_id,
    eos_token_id=tokenizer.eos_token_id,
)

# Initialize the model with the defined configuration
model = GPT2LMHeadModel(config)

# Tokenize the input text
tokenized = tokenizer(
    'The quick brown fox jumps over the lazy dog',
    return_tensors='pt',
)

input_ids = tokenized['input_ids']

tokens = [tokenizer.convert_ids_to_tokens(t.item()) for t in input_ids[0]]

with torch.no_grad():
    res = model(input_ids=input_ids.to(model.device), output_attentions=True)

# Visualize the attention maps using the Inspectus library
attention(res['attentions'], tokens)
```

Check out the notebook here: [Huggingface Tutorial](./notebooks/gpt2.ipynb)


### Custom Defined Attentions

```python
import numpy as np
from inspectus import attention

arr = np.random.rand(3, 5)

attention(arr, ['a', 'b', 'c'], [f'{i}' for i in range(5)])
```

Check out the notebook here: [Custom Attention Tutorial](./notebooks/custom_attn.ipynb)


# Setting up for Development

[Development README](./DEV_README.md)