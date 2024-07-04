[![PyPI - Python Version](https://badge.fury.io/py/inspectus.svg)](https://badge.fury.io/py/inspectus)
[![PyPI Status](https://pepy.tech/badge/inspectus)](https://pepy.tech/project/inspectus)
[![Twitter](https://img.shields.io/twitter/follow/labmlai?style=social)](https://twitter.com/labmlai?ref_src=twsrc%5Etfw)

# Inspectus

Inspectus is a versatile visualization tool for machine learning. It runs smoothly in Jupyter notebooks via an easy-to-use Python API.

## Content

- [Installation](#installation)
- [Attention Visualization](#attention-visualization)
  - [Preview](#preview)
  - [Components](#components)
  - [Usage](#usage)
  - [Tutorials](#tutorials)
    - [Huggingface model](#huggingface-model)
    - [Custom attention map](#custom-attention-map)
- [Distribution Plot](#distribution-plot)
  - [Preview](#preview-1)
  - [Usage](#usage-1)
  - [Sample Use case](#sample-use-case)
- [Setting up for Development](#setting-up-for-development)
- [Citing](#citing)

## Installation

```bash
pip install inspectus
```

## Attention Visualization

Inspectus provides visualization tools for attention mechanisms in deep learning models. 
It provides a set of comprehensive views, making it easier to understand how these models work.

### Preview

![Inspectus](https://github.com/labmlai/inspectus/raw/main/assets/preview.gif)

*Click a token to select it and deselect others. Clicking again will select all again. 
To change the state of only one token, do shift+click*

### Components

**Attention Matrix**:
Visualizes the attention scores between tokens, highlighting how each token focuses on others during processing.

**Query Token Heatmap**:
Shows the sum of attention scores between each query and selected key tokens

**Key Token Heatmap**:
Shows the sum of attention scores between each key and selected query tokens

**Dimension Heatmap**:
Shows the sum of attention scores for each item in dimensions (Layers and Heads) normalized over the dimension.

#### Usage

Import the library

```python
import inspectus
```

Simple usage

```python
# attn: Attention map; a 2-4D tensor or attention maps from Huggingface transformers
inspectus.attention(attn, tokens)
```

For different query and key tokens

```python
inspectus.attention(attns, query_tokens, key_tokens)
```

For detailed API documentation, please refer to the [official documentation - wip]().

### Tutorials

#### Huggingface model

```python
from transformers import AutoTokenizer, GPT2LMHeadModel, AutoConfig
import torch
import inspectus

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
inspectus.attention(res['attentions'], tokens)
```

Check out the notebook here: [Huggingface Tutorial](./notebooks/gpt2.ipynb)


#### Custom attention map

```python
import numpy as np
import inspectus

# 2D attention representing attention values between Query and Key tokens
attn = np.random.rand(3, 3)

# Visualize the attention values using the Inspectus library
# The first argument is the attention matrix
# The second argument is the list of query tokens
# The third argument is the list of key tokens
inspectus.attention(arr, ['a', 'b', 'c'], ['d', 'e', 'f'])
```

Check out the notebook here: [Custom attention map tutorial](./notebooks/custom_attn.ipynb)

## Distribution Plot
The distribution plot is a plot that shows the distribution of a series of data. At each step, 
the distribution of the data is calculated and maximum of 5 bands are drawn from 9 basis points. 
(0, 6.68, 15.87, 30.85, 50.00, 69.15, 84.13, 93.32, 100.00) 


#### Preview
![Inspectus](https://github.com/labmlai/inspectus/raw/main/assets/mnist_train_loss_tail.gif)

#### Usage

```python
import inspectus

inspectus.distribution({'x': [x for x in range(0, 100)]})
```

To focus on parts of the plot and zoom in, the minimap can be used. To select a single plot, use the legend on the top right.

For comprehensive usage guide please check the notebook here: [Distribution Plot Tutorial](./notebooks/distribution_plot.ipynb)

#### Sample Use case

This plot can be used to identify the existence of outliers in the data. Following 
notebooks demonstrate how to use the distribution plot to identify outliers in the MNIST training loss.

[MNIST](./notebooks/mnist.ipynb)

## Setting up for Development

[Development Docs](https://github.com/labmlai/inspectus/blob/main/development.md)

## Citing

If you use Inspectus for academic research, please cite the library using the following BibTeX entry.

```bibtext
@misc{inspectus,
 author = {Varuna Jayasiri, Lakshith Nishshanke},
 title = {inspectus: A visualization and analytics tool for large language models},
 year = {2024},
 url = {https://github.com/labmlai/inspectus},
}
```

