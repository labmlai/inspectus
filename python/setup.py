import setuptools
import inspectus

with open("../README.md", "r") as f:
    long_description = f.read()

setuptools.setup(
    name='inspectus',
    version=inspectus.__version__,
    author="labml.ai",
    author_email="contact@labml.ai",
    description="Analytics for LLMs",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/labmlai/inspectus",
    project_urls={
        'Documentation': 'https://docs.labml.ai/'
    },
    packages=['inspectus'],
    include_package_data=True,
    install_requires=[],
    entry_points={
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'Topic :: Scientific/Engineering',
        'Topic :: Scientific/Engineering :: Mathematics',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        'Topic :: Software Development',
        'Topic :: Software Development :: Libraries',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
    keywords='llm',
)
