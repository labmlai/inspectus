# Readme

Inspectus is a versatile visualization tool for large language models.
It runs smoothly in Jupyter notebooks via an easy-to-use Python API. Inspectus provides multiple views, offering diverse insights into language model behaviors.

## Preview

![Inspectus](Images/preview.gif)

## Components

### Attention Matrix
Visualizes the attention scores between tokens, highlighting how each token focuses on others during processing.

### Token Heatmap
- Query Heatmap: Shows the sum of attention scores between each query and selected key tokens
- Key Heatmap: Shows the sum of attention scores between each key and selected query tokens

### Dimension Heatmap 
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
tokenizer = AutoTokenizer.from_pretrained("huggingface-course/code-search-net-tokenizer")

config = AutoConfig.from_pretrained(
    "gpt2",
    vocab_size=len(tokenizer),  # Set the vocabulary size to the length of the tokenizer
    n_ctx=context_length,  # Set the context length
    bos_token_id=tokenizer.bos_token_id,  # Set the beginning of sentence token id
    eos_token_id=tokenizer.eos_token_id,  # Set the end of sentence token id
)

model = GPT2LMHeadModel(config)

# Tokenize the input text
tokenized = tokenizer(
    'The quick brown fox jumps over the lazy dog',
    return_tensors='pt',
)

# Disable gradient calculation as we're not training the model, just running inference
with torch.no_grad():
    # Run the model and get the get attentions
    res = model(**tokenized, output_attentions=True)

# Get the tokens
tokens = [tokenizer.convert_ids_to_tokens(t.item()) for t in tokenized['input_ids'][0]]

# Visualize the attention maps using the Inspectus library
attention(res['attentions'], tokens)
```

Check out the notebook here: [Inspectus Tutorial]()


### Custom attention map

```python
# Import the necessary libraries
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

Check out the notebook here: [Inspectus Tutorial]()
