# Sanagi Labs

A space for learning, building, and soft experiments in AI.  
Learn in public.

## Machine Learning Micro Note Roadmap (Basics to Advanced Models)

This roadmap progresses from foundational knowledge to classical ML, dives into Deep Learning fundamentals and architectures, covers specialized topics, and concludes with practical implementation and analysis. Each checklist item represents a target topic for a single micro note.

---

### Part I: Foundations

_This part covers the essential prerequisites._

#### `00 - Foundations`

- **Math:**
  - - [ ] Vectors and Matrices (Linear Algebra Basics)
  - - [ ] Dot Product Explained
  - - [ ] Derivatives and Gradients (Calculus Basics)
  - - [ ] Chain Rule Explained
  - - [ ] Basic Probability Concepts
  - - [ ] Common Probability Distributions (Normal, Bernoulli)
  - - [ ] Bayes' Theorem Explained
- **Programming & Data:**
  - - [ ] Python Basics (for ML)
  - - [ ] NumPy Introduction (Arrays, Operations)
  - - [ ] Pandas Introduction (DataFrames, Series)
  - - [ ] Matplotlib / Seaborn (Basic Plotting)
  - - [ ] Vectorization Explained
  - - [ ] What is Big Data?
  - - [ ] Data Loading and Handling
  - - [ ] Data Cleaning (Handling Missing Values)
  - - [ ] Handling Categorical Features (One-Hot Encoding)
  - - [ ] Feature Scaling (Normalization, Standardization)
  - - [ ] Feature Engineering Concepts (incl. Interaction Features)
  - - [ ] Binning / Discretization
  - - [ ] Univariate Nonlinear Transformations (Log, Sqrt, etc.)
  - - [ ] Feature Selection Methods (Filter, Wrapper, Embedded)
  - - [ ] Utilizing Expert Knowledge in Feature Eng.
  - - [ ] Training, Validation, and Test Sets
- **Search & Optimization (Non-Gradient):**
  - - [ ] Search Space / State Space Search
  - - [ ] Hill Climbing Algorithm
  - - [ ] Simulated Annealing Algorithm

---

### Part II: Classical Machine Learning

_Focuses on traditional ML algorithms that don't typically involve deep neural networks._

#### `01 - Classical ML - Supervised`

- - [ ] What is Supervised Learning? (incl. Regression vs. Classification)
- - [ ] Linear Regression Explained
- - [ ] Ridge Regression (L2 Regularization for LinReg)
- - [ ] Lasso Regression (L1 Regularization for LinReg)
- - [ ] Polynomial Regression
- - [ ] Logistic Regression Explained
- - [ ] Decision Boundary Concept
- - [ ] K-Nearest Neighbors (KNN) Algorithm
- - [ ] Naive Bayes Classifier
- - [ ] Support Vector Machines (SVM) (incl. Kernels)
- - [ ] Decision Trees (incl. Splitting Criteria, Pruning, Regression Trees)
- - [ ] Random Forests Algorithm
- - [ ] AdaBoost Algorithm
- - [ ] Gradient Boosting Machines (GBM) - Core Idea
- - [ ] Bias-Variance Tradeoff Explained

#### `02 - Classical ML - Unsupervised`

- - [ ] What is Unsupervised Learning? (incl. Clustering vs. Dim Reduction)
- - [ ] K-Means Clustering (incl. Initialization, Choosing K)
- - [ ] Hierarchical Clustering (Agglomerative)
- - [ ] DBSCAN Algorithm
- - [ ] Anomaly Detection Overview
- - [ ] Principal Component Analysis (PCA) Explained
- - [ ] Non-Negative Matrix Factorization (NMF)
- - [ ] Manifold Learning Overview (Isomap, LLE ideas)
- - [ ] t-SNE (for Visualization)
- - [ ] Topic Modeling Overview (incl. LDA)

---

### Part III: Model Training and Evaluation

_Covers the crucial cross-cutting concepts for building and assessing any ML model._

#### `03 - Model Training & Evaluation`

- - [ ] Loss Functions (Overview & Common Examples)
- - [ ] Gradient Descent Explained
- - [ ] Gradient Descent Variants & Learning Rate (Batch, Mini-batch, Stochastic)
- - [ ] Checking Gradient Descent Convergence
- - [ ] Optimization Algorithms Overview (Adam, RMSprop)
- - [ ] Overfitting and Underfitting Explained
- - [ ] Model Complexity Concept
- - [ ] Regularization (L1, L2) - Core Idea
- - [ ] Cross-Validation Explained (k-Fold, Stratified)
- - [ ] The Bootstrap Method (Bootstrapping)
- - [ ] Bagging (Bootstrap Aggregating)
- - [ ] Hyperparameter Tuning Methods (Grid Search, Random Search)
- - [ ] Evaluating Clustering Performance
- - [ ] Evaluating Anomaly Detection Performance
- - [ ] Manual Evaluation Methods (for NLP/LLMs)
- - [ ] Establishing Performance Baselines
- - [ ] Learning Curves Explained
- - [ ] Error Analysis Techniques
- - [ ] Handling Imbalanced Datasets
- - [ ] Uncertainty Estimation in Models (Decision Function, Probabilities)
- - [ ] Evolutionary Computation Overview
- - [ ] Genetic Programming Overview
- - [ ] Regression Evaluation Metrics (MAE, MSE/RMSE, R-squared)
- - [ ] Classification Evaluation Metrics (Accuracy, Precision, Recall, F1)
- - [ ] Precision-Recall Tradeoff Explained
- - [ ] Confusion Matrix Explained
- - [ ] ROC Curve and AUC Explained

---

### Part IV: Deep Learning Fundamentals

_Introduces neural networks and the core concepts behind deep learning._

#### `04 - Deep Learning Fundamentals`

- - [ ] The Perceptron / Artificial Neuron
- - [ ] Activation Functions Overview (Why use? Common types)
- - [ ] Why Activation Functions are Needed (Non-linearity)
- - [ ] Neural Network / Multi-Layer Perceptron (MLP) Explained
- - [ ] Common Neural Network Layer Types - Overview
- - [ ] Feedforward Computation Explained
- - [ ] Backpropagation Explained (incl. Computation Graph)
- - [ ] Vanishing and Exploding Gradients Problem
- - [ ] Weight Initialization Techniques - Overview
- - [ ] Batch Normalization Explained
- - [ ] Dropout Explained
- - [ ] Transfer Learning - General Concept

---

### Part V: Deep Learning for Computer Vision

_Focuses on specialized architectures and techniques for image data._

#### `05 - Computer Vision (CNNs)`

- - [ ] Representing Images Digitally (Pixels, Channels)
- - [ ] Convolution Operation Explained
- - [ ] Filters / Kernels in CNNs
- - [ ] Padding and Stride Explained
- - [ ] Pooling Layers Explained (Max Pooling, Average Pooling)
- - [ ] Basic CNN Architecture Explained (Conv -> Activation -> Pool)
- - [ ] LeNet-5 Architecture (Historical Context)
- - [ ] AlexNet & VGG Architectures (Key Ideas)
- - [ ] ResNet Architecture & Residual Connections
- - [ ] Transfer Learning for Images (Using Pretrained CNNs)
- - [ ] Data Augmentation for Images

---

### Part VI: Deep Learning for Sequences and Language

_Covers models designed for sequential data, leading up to modern NLP._

#### `06 - Sequential Models & NLP Basics (RNNs)`

- - [ ] Handling Sequence Data (Text, Time Series)
- - [ ] Text Preprocessing Overview (Tokenization, Stopwords, Stemming, Lemmatization)
- - [ ] Text Features: Bag-of-Words
- - [ ] Text Features: TF-IDF
- - [ ] N-gram Language Models
- - [ ] Text Features: n-Grams
- - [ ] Representing Words: One-Hot Encoding vs Embeddings
- - [ ] Word Embeddings Overview (Why use them?)
- - [ ] Word2Vec Algorithm (Skip-gram / CBOW)
- - [ ] GloVe Algorithm
- - [ ] Recurrent Neural Networks (RNN) - Core Idea & Limitations
- - [ ] Backpropagation Through Time (BPTT)
- - [ ] Long Short-Term Memory (LSTM) Networks Explained
- - [ ] Gated Recurrent Unit (GRU) Networks Explained
- - [ ] Encoder-Decoder (Seq2Seq) Architecture - Basic Idea
- - [ ] Using CNNs for Text Classification

#### `07 - Attention & Transformers`

- - [ ] Limitation of Fixed Context Vectors in Seq2Seq
- - [ ] Attention Mechanism - Core Idea (Query, Key, Value)
- - [ ] Self-Attention Explained
- - [ ] Multi-Head Attention Explained
- - [ ] Positional Encoding Explained
- - [ ] The Transformer Architecture: Encoder Block
- - [ ] The Transformer Architecture: Decoder Block
- - [ ] The Transformer Architecture: Encoder-Decoder Interaction

#### `08 - Large Language Models (LLMs)`

- - [ ] Language Modeling Task Explained (Predicting Next Token)
- - [ ] BERT Architecture & Concepts (Encoder-Only, MLM)
- - [ ] GPT Architecture & Concepts (Decoder-Only, Autoregressive)
- - [ ] GPT-2 Architecture & Concepts (Scaling, Dataset, Zero-shot)
- - [ ] Pre-training vs. Fine-tuning Explained
- - [ ] Tokenization for LLMs (Subword Tokenization, BPE)
- - [ ] LLM Decoding Strategies Overview (Greedy, Beam Search, Sampling)
- - [ ] Prompt Engineering Basics
- - [ ] Few-Shot & Zero-Shot Learning Concepts
- - [ ] Retrieval-Augmented Generation (RAG) Explained
- - [ ] Multimodal Models - Overview
- - [ ] LLM Agents - Core Idea

---

### Part VII: Advanced Generative Models

_Explores other powerful models focused on data generation beyond LLMs._

#### `09 - Other Generative Models`

- - [ ] Generative vs. Discriminative Models Explained
- - [ ] Autoencoders (AE) Explained
- - [ ] Variational Autoencoders (VAE) Explained
- - [ ] Generative Adversarial Networks (GANs) Explained
- - [ ] GANs - Training & Challenges (Minimax, Mode Collapse)
- - [ ] Diffusion Models Explained (Forward/Reverse Process, Noise Schedules)

---

### Part VIII: Specialized ML Topics

_Dives into distinct paradigms and application areas within ML._

#### `12 - Recommender Systems`

- - [ ] Recommender Systems - Overview & Types
- - [ ] Collaborative Filtering Explained
- - [ ] Content-Based Filtering Explained
- - [ ] Mean Normalization (for RecSys)
- - [ ] Measuring Similarity (for RecSys)
- - [ ] Deep Learning for Recommender Systems Overview

#### `13 - Reinforcement Learning`

- - [ ] Reinforcement Learning - Overview
- - [ ] Markov Decision Process (MDP) Explained
- - [ ] Key RL Concepts: Policy, Value Function, Q-value, Return, Reward
- - [ ] Bellman Equation Explained
- - [ ] Q-Learning Algorithm - Basic Idea
- - [ ] Exploration vs. Exploitation (Epsilon-Greedy)

---

### Part IX: Practical Implementation and Analysis

_Focuses on tools and applying knowledge to understand specific models._

#### `10 - Tools & Libraries`

- - [ ] Using Scikit-learn (for Classical ML)
- - [ ] Using Scikit-learn Pipelines
- - [ ] PyTorch Basics (Tensors, Autograd, nn.Module)
- - [ ] PyTorch DataLoader and Datasets
- - [ ] TensorFlow / Keras Basics Overview
- - [ ] Using Hugging Face `transformers` Library
- - [ ] Experiment Tracking (Weights & Biases / TensorBoard)

#### `11 - Model Deep Dives`

- (_Note: These represent larger analysis tasks_)
- - [ ] Analysis: GPT-2 Model
- - [ ] Analysis: Stable Diffusion Model
- - [ ] Analysis: [Add other models as needed]

---
