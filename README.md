# Inspectus

Inspectus is a versatile visualization tool for large language models.
It runs smoothly in Jupyter notebooks via an easy-to-use Python API. Inspectus provides multiple views, offering diverse insights into language model behaviors.

## Preview

![Inspectus](Images/preview.gif)

## Components

**Attention Matrix**:
Visualizes the attention scores between tokens, highlighting how each token focuses on others during processing.

**Query Token Heatmap**:
Shows the sum of attention scores between each query and selected key tokens

**Key Token Heatmap**:
Shows the sum of attention scores between each key and selected query tokens

**Dimension Heatmap**:
Shows the sum of attention scores for each item in dimensions (Layers and Heads) normalized over the dimension.

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
# attn: Attention map; a 2-4D tensor or attention maps from Huggingface transformers
attention(attn, tokens)
```

For different query and key tokens

```python
attention(attns, query_tokens, key_tokens)
```

For detailed API documentation, please refer to the [official documentation - wip]().

## Tutorials

### Huggingface model

```python
from transformers import AutoTokenizer, GPT2LMHeadModel, AutoConfig
import torch
from inspectus import attention

# Initialize the tokenizer and model
context_length = 128
tokenizer = AutoTokenizer.from_pretrained("huggingface-course/code-search-net-tokenizer")

config = AutoConfig.from_pretrained(
    "gpt2",
    vocab_size=len(tokenizer),
    n_ctx=context_length,
    bos_token_id=tokenizer.bos_token_id,
    eos_token_id=tokenizer.eos_token_id,
)

model = GPT2LMHeadModel(config)

# Tokenize the input text
text= 'The quick brown fox jumps over the lazy dog'
tokenized = tokenizer(
    text,
    return_tensors='pt',
    return_offsets_mapping=True
)
input_ids = tokenized['input_ids']

tokens = [text[s: e] for s, e in tokenized['offset_mapping'][0]]

with torch.no_grad():
    res = model(input_ids=input_ids.to(model.device), output_attentions=True)

# Visualize the attention maps using the Inspectus library
attention(res['attentions'], tokens)
```

Check out the notebook here: [Huggingface Tutorial](./notebooks/gpt2.ipynb)


### Custom attention map

```python
import numpy as np
from inspectus import attention

# 2D attention representing attention values between Query and Key tokens
attn = np.random.rand(3, 3)

# Visualize the attention values using the Inspectus library
# The first argument is the attention matrix
# The second argument is the list of query tokens
# The third argument is the list of key tokens
attention(arr, ['a', 'b', 'c'], ['d', 'e', 'f'])
```

Check out the notebook here: [Custom attention map tutorial](./notebooks/custom_attn.ipynb)

