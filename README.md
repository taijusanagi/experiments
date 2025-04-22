# Taiju Sanagi: Experiments

A space for learning, building, and soft experiments in AI.

This roadmap progresses from foundational knowledge to classical ML, dives into Deep Learning fundamentals and architectures, covers specialized topics, and concludes with practical implementation and analysis. Each checklist item represents a target topic for a single micro note.

---

## Part I: Foundations

_This part covers the essential prerequisites._

### `00 - Foundations`

- **Math:**
  - - [ ] Vectors and Matrices (slug: `linear-algebra-basics`)
  - - [ ] Dot Product (slug: `dot-product`)
  - - [ ] Derivatives and Gradients (slug: `derivatives-gradients`)
  - - [ ] Chain Rule (slug: `chain-rule`)
  - - [ ] Probability (slug: `probability-basics`)
  - - [ ] Probability Distributions (slug: `probability-distributions`)
  - - [ ] Bayes' Theorem (slug: `bayes-theorem`)
- **Programming & Data:**
  - - [ ] Python for ML (slug: `python-basics-ml`)
  - - [ ] NumPy (slug: `numpy-intro`)
  - - [ ] Pandas (slug: `pandas-intro`)
  - - [ ] Matplotlib / Seaborn Plotting (slug: `matplotlib-seaborn-plotting`)
  - - [ ] Vectorization (slug: `vectorization`)
  - - [ ] Big Data (slug: `big-data-concepts`)
  - - [ ] Data Loading and Handling (slug: `data-loading-handling`)
  - - [ ] Data Cleaning / Missing Values (slug: `data-cleaning-missing-values`)
  - - [ ] Handling Categorical Features / One-Hot (slug: `categorical-features-one-hot`)
  - - [ ] Feature Scaling (slug: `feature-scaling`)
  - - [ ] Feature Engineering (slug: `feature-engineering-concepts`)
  - - [ ] Binning / Discretization (slug: `binning-discretization`)
  - - [ ] Univariate Transformations (slug: `univariate-transformations`)
  - - [ ] Feature Selection (slug: `feature-selection-methods`)
  - - [ ] Expert Knowledge in Feature Eng. (slug: `expert-knowledge-feature-eng`)
  - - [ ] Train/Validation/Test Sets (slug: `train-validation-test-sets`)
- **Search & Optimization (Non-Gradient):**
  - - [ ] State Space Search (slug: `state-space-search`)
  - - [ ] Hill Climbing (slug: `hill-climbing`)
  - - [ ] Simulated Annealing (slug: `simulated-annealing`)

---

## Part II: Classical Machine Learning

_Focuses on traditional ML algorithms that don't typically involve deep neural networks._

### `01 - Classical ML - Supervised`

- - [ ] Supervised Learning (slug: `supervised-learning-intro`)
- - [x] Linear Regression (slug: `linear-regression`)
- - [x] Ridge Regression (slug: `ridge-regression`)
- - [x] Lasso Regression (slug: `lasso-regression`)
- - [x] Polynomial Regression (slug: `polynomial-regression`)
- - [x] Logistic Regression (slug: `logistic-regression`)
- - [x] Decision Boundary (slug: `decision-boundary`)
- - [x] K-Nearest Neighbors (KNN) (slug: `knn`)
- - [x] Bernoulli Naive Bayes (slug: `bernoulli-naive-bayes`)
- - [x] Multinomial Naive Bayes (slug: `multinomial-naive-bayes`)
- - [x] Gaussian Naive Bayes (slug: `gaussian-naive-bayes`)
- - [ ] Support Vector Machines (SVM) & Kernels (slug: `svm-kernels`)
- - [x] Decision Tree (slug: `decision-tree`)
- - [x] Random Forests (slug: `random-forests`)
- - [x] AdaBoost (slug: `adaboost`)
- - [ ] Gradient Boosting Machines (GBM) (slug: `gbm`)
- - [x] Bias-Variance Tradeoff (slug: `bias-variance-tradeoff`)

### `02 - Classical ML - Unsupervised`

- - [ ] Unsupervised Learning (slug: `unsupervised-learning-intro`)
- - [x] K-Means Clustering (slug: `kmeans-clustering`)
- - [x] Hierarchical Clustering (slug: `hierarchical-clustering`)
- - [x] DBSCAN (slug: `dbscan`)
- - [x] Anomaly Detection (slug: `anomaly-detection`)
- - [x] Principal Component Analysis (PCA) (slug: `pca`)
- - [ ] Non-Negative Matrix Factorization (NMF) (slug: `nmf`)
- - [x] Manifold Learning (slug: `manifold-learning`)
- - [ ] t-SNE Visualization (slug: `tsne`)
- - [ ] Topic Modeling & LDA (slug: `topic-modeling-lda`)

---

## Part III: Model Training and Evaluation

_Covers the crucial cross-cutting concepts for building and assessing any ML model._

### `03 - Model Training & Evaluation`

- - [ ] Loss Functions (slug: `loss-functions`)
- - [ ] Gradient Descent (slug: `gradient-descent`)
- - [ ] GD Variants & Learning Rate (slug: `gradient-descent-variants-lr`)
- - [ ] GD Convergence (slug: `gradient-descent-convergence`)
- - [ ] Optimization Algorithms (Adam, RMSprop) (slug: `optimization-algorithms`)
- - [ ] Overfitting and Underfitting (slug: `overfitting-underfitting`)
- - [ ] Model Complexity (slug: `model-complexity`)
- - [ ] Regularization (L1/L2) (slug: `regularization-l1-l2`)
- - [ ] Cross-Validation (slug: `cross-validation`)
- - [ ] Bootstrap Method (slug: `bootstrap-method`)
- - [ ] Bagging (slug: `bagging`)
- - [ ] Hyperparameter Tuning (slug: `hyperparameter-tuning`)
- - [ ] Evaluating Clustering (slug: `evaluating-clustering`)
- - [ ] Evaluating Anomaly Detection (slug: `evaluating-anomaly-detection`)
- - [ ] Manual Evaluation (NLP/LLMs) (slug: `manual-evaluation-nlp`)
- - [ ] Establishing Baselines (slug: `establishing-baselines`)
- - [ ] Learning Curves (slug: `learning-curves`)
- - [ ] Error Analysis (slug: `error-analysis`)
- - [ ] Handling Imbalanced Datasets (slug: `handling-imbalanced-datasets`)
- - [ ] Uncertainty Estimation (slug: `uncertainty-estimation`)
- - [ ] Evolutionary Computation (slug: `evolutionary-computation`)
- - [ ] Genetic Programming (slug: `genetic-programming`)
- - [ ] Regression Metrics (slug: `regression-metrics`)
- - [ ] Classification Metrics (slug: `classification-metrics`)
- - [ ] Precision-Recall Tradeoff (slug: `precision-recall-tradeoff`)
- - [ ] Confusion Matrix (slug: `confusion-matrix`)
- - [ ] ROC Curve & AUC (slug: `roc-curve-auc`)

---

## Part IV: Deep Learning Fundamentals

_Introduces neural networks and the core concepts behind deep learning._

### `04 - Deep Learning Fundamentals`

- - [x] Perceptron / Artificial Neuron (slug: `perceptron`)
- - [ ] Activation Functions (slug: `activation-functions`)
- - [ ] Need for Activation Functions (slug: `why-activation-functions`)
- - [ ] Multi-Layer Perceptron (MLP) (slug: `mlp`)
- - [ ] Neural Network Layer Types (slug: `nn-layer-types`)
- - [ ] Feedforward Computation (slug: `feedforward-computation`)
- - [ ] Backpropagation (slug: `backpropagation`)
- - [ ] Vanishing/Exploding Gradients (slug: `vanishing-exploding-gradients`)
- - [ ] Weight Initialization (slug: `weight-initialization`)
- - [ ] Batch Normalization (slug: `batch-normalization`)
- - [ ] Dropout (slug: `dropout`)
- - [ ] Transfer Learning (slug: `transfer-learning-concept`)

---

## Part V: Deep Learning for Computer Vision

_Focuses on specialized architectures and techniques for image data._

### `05 - Computer Vision (CNNs)`

- - [ ] Digital Image Representation (slug: `image-representation`)
- - [ ] Convolution Operation (slug: `convolution-operation`)
- - [ ] CNN Filters / Kernels (slug: `cnn-filters-kernels`)
- - [ ] CNN Padding & Stride (slug: `cnn-padding-stride`)
- - [ ] CNN Pooling Layers (slug: `cnn-pooling-layers`)
- - [ ] Basic CNN Architecture (slug: `basic-cnn-architecture`)
- - [ ] LeNet-5 Architecture (slug: `lenet5`)
- - [ ] AlexNet & VGG Architectures (slug: `alexnet-vgg`)
- - [ ] ResNet & Residual Connections (slug: `resnet-residual-connections`)
- - [ ] Image Transfer Learning (slug: `transfer-learning-images`)
- - [ ] Image Data Augmentation (slug: `data-augmentation-images`)

---

## Part VI: Deep Learning for Sequences and Language

_Covers models designed for sequential data, leading up to modern NLP._

### `06 - Sequential Models & NLP Basics (RNNs)`

- - [ ] Handling Sequence Data (slug: `sequence-data`)
- - [ ] Text Preprocessing (slug: `text-preprocessing`)
- - [ ] Bag-of-Words (slug: `bag-of-words`)
- - [ ] TF-IDF (slug: `tf-idf`)
- - [ ] N-gram Language Models (slug: `ngram-language-models`)
- - [ ] n-Gram Text Features (slug: `ngram-text-features`)
- - [ ] One-Hot vs Embeddings (slug: `one-hot-vs-embeddings`)
- - [ ] Word Embeddings (slug: `word-embeddings-overview`)
- - [ ] Word2Vec (slug: `word2vec`)
- - [ ] GloVe (slug: `glove`)
- - [ ] Recurrent Neural Networks (RNN) (slug: `rnn-basics`)
- - [ ] Backpropagation Through Time (BPTT) (slug: `bptt`)
- - [ ] Long Short-Term Memory (LSTM) (slug: `lstm`)
- - [ ] Gated Recurrent Unit (GRU) (slug: `gru`)
- - [ ] Encoder-Decoder (Seq2Seq) Architecture (slug: `seq2seq-architecture`)
- - [ ] CNNs for Text Classification (slug: `cnn-for-text`)

### `07 - Attention & Transformers`

- - [ ] Seq2Seq Context Vector Limitations (slug: `seq2seq-context-vector-limitations`)
- - [ ] Attention Mechanism (slug: `attention-mechanism`)
- - [ ] Self-Attention (slug: `self-attention`)
- - [ ] Multi-Head Attention (slug: `multi-head-attention`)
- - [ ] Positional Encoding (slug: `positional-encoding`)
- - [ ] Transformer Encoder (slug: `transformer-encoder`)
- - [ ] Transformer Decoder (slug: `transformer-decoder`)
- - [ ] Transformer Encoder-Decoder Interaction (slug: `transformer-encoder-decoder`)

### `08 - Large Language Models (LLMs)`

- - [ ] Language Modeling (slug: `language-modeling`)
- - [ ] BERT Architecture (slug: `bert`)
- - [ ] GPT Architecture (slug: `gpt-architecture`)
- - [ ] GPT-2 Architecture (slug: `gpt2-architecture-concepts`)
- - [ ] Pre-training vs Fine-tuning (slug: `pretraining-finetuning`)
- - [ ] LLM Tokenization (slug: `llm-tokenization`)
- - [ ] LLM Decoding Strategies (slug: `llm-decoding-strategies`)
- - [ ] Prompt Engineering (slug: `prompt-engineering`)
- - [ ] Few-Shot & Zero-Shot Learning (slug: `few-shot-zero-shot-learning`)
- - [ ] Retrieval-Augmented Generation (RAG) (slug: `rag`)
- - [ ] Multimodal Models (slug: `multimodal-models`)
- - [ ] LLM Agents (slug: `llm-agents`)

---

## Part VII: Advanced Generative Models

_Explores other powerful models focused on data generation beyond LLMs._

### `09 - Other Generative Models`

- - [ ] Generative vs Discriminative Models (slug: `generative-vs-discriminative`)
- - [ ] Autoencoders (AE) (slug: `autoencoders`)
- - [ ] Variational Autoencoders (VAE) (slug: `vae`)
- - [ ] Generative Adversarial Networks (GANs) (slug: `gans`)
- - [ ] GAN Training & Challenges (slug: `gan-training-challenges`)
- - [ ] Diffusion Models (slug: `diffusion-models`)

---

## Part VIII: Specialized ML Topics

_Dives into distinct paradigms and application areas within ML._

### `12 - Recommender Systems`

- - [ ] Recommender Systems (slug: `recsys-overview`)
- - [ ] Collaborative Filtering (slug: `collaborative-filtering`)
- - [ ] Content-Based Filtering (slug: `content-based-filtering`)
- - [ ] RecSys Mean Normalization (slug: `recsys-mean-normalization`)
- - [ ] RecSys Similarity Measures (slug: `recsys-similarity-measures`)
- - [ ] Deep Learning for RecSys (slug: `deep-learning-recsys`)

### `13 - Reinforcement Learning`

- - [ ] Reinforcement Learning (slug: `rl-overview`)
- - [ ] Markov Decision Process (MDP) (slug: `mdp`)
- - [ ] RL Key Concepts (Policy, Value, Q-value, Return, Reward) (slug: `rl-key-concepts`)
- - [ ] Bellman Equation (slug: `bellman-equation`)
- - [ ] Q-Learning (slug: `q-learning`)
- - [ ] RL Exploration vs Exploitation (Epsilon-Greedy) (slug: `rl-exploration-exploitation`)

---

## Part IX: Practical Implementation and Analysis

_Focuses on tools and applying knowledge to understand specific models._

### `10 - Tools & Libraries`

- - [ ] Using Scikit-learn (slug: `sklearn-basics`)
- - [ ] Scikit-learn Pipelines (slug: `sklearn-pipelines`)
- - [ ] PyTorch Basics (slug: `pytorch-basics`)
- - [ ] PyTorch DataLoader/Dataset (slug: `pytorch-dataloader-dataset`)
- - [ ] TensorFlow/Keras Basics (slug: `tensorflow-keras-basics`)
- - [ ] Using Hugging Face Transformers (slug: `huggingface-transformers`)
- - [ ] Experiment Tracking Tools (slug: `experiment-tracking-tools`)

### `11 - Model Deep Dives`

- (_Note: These represent larger analysis tasks_)
- - [ ] Analysis: GPT-2 (slug: `analysis-gpt2`)
- - [ ] Analysis: Stable Diffusion (slug: `analysis-stable-diffusion`)
- - [ ] Analysis: [Model Name] (slug: `analysis-[model-name]`)

---
