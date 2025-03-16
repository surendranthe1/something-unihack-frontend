import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeDetailPanel from './NodeDetailPanel';
import { SkillMap, SkillNode } from '../../types';
import { X, Minimize2, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { AnimatePresence, motion } from 'framer-motion';

interface SkillTreeProps {
  skillMap: SkillMap;
}

// Function to interpolate colors for nodes
const interpolateColor = (i: number): string => {
  const greenstart = [4, 202, 151];
  const greenend = [88, 242, 169];
  const bluestart = [25, 80, 243];
  const blueend = [85, 128, 253];
  const yellowstart = [255, 196, 53];
  const yellowend = [255, 234, 123];
  let startColor: number[], endColor: number[], ratio: number;

  if (i <= 10) {
    startColor = greenstart;
    endColor = greenend;
    ratio = (i - 1) / 9;
  } else if (i <= 20) {
    startColor = bluestart;
    endColor = blueend;
    ratio = (i - 11) / 9;
  } else {
    startColor = yellowstart;
    endColor = yellowend;
    ratio = (i - 21) / 9;
  }

  const interpolated = startColor.map((start, index) =>
    Math.round(start + (endColor[index] - start) * ratio)
  );

  return `rgb(${interpolated[0]}, ${interpolated[1]}, ${interpolated[2]})`;
};

// Roadmap data with depth and progress added
const roadmap: SkillNode[] = [
  { id: '1', name: 'Day 1: Introduction to Machine Learning', description: 'Understand what ML is, its types (supervised, unsupervised, reinforcement learning), and real-world applications.', status: 'not_started', estimatedHours: 3, resources: [{ name: 'ML Crash Course (Google)', type: 'course', url: 'https://developers.google.com/machine-learning/crash-course' }, { name: 'Andrew Ng\'s "What is Machine Learning?"', type: 'video', url: 'https://www.coursera.org/lecture/machine-learning/what-is-machine-learning-Ujm7v' }], children: ['Day 2: Python for ML'], depth: 1, progress: 0 },
  { id: '2', name: 'Day 2: Python for ML', description: 'Learn Python basics relevant to ML, including NumPy, Pandas, and Matplotlib.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'Python for Data Science (Datacamp)', type: 'course', url: 'https://www.datacamp.com/courses/intro-to-python-for-data-science' }, { name: 'NumPy & Pandas Cheat Sheet', type: 'article', url: 'https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf' }], children: ['Day 3: Probability & Statistics for ML'], depth: 1, progress: 0 },
  { id: '3', name: 'Day 3: Probability & Statistics for ML', description: 'Basic statistics concepts: mean, variance, distributions, probability theory, and Bayes’ theorem.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'Khan Academy - Probability & Statistics', type: 'course', url: 'https://www.khanacademy.org/math/statistics-probability' }, { name: 'StatQuest - Probability & Bayes’ Theorem', type: 'video', url: 'https://www.youtube.com/watch?v=HZGCoVF3YvM' }], children: ['Day 4: Linear Algebra for ML'], depth: 1, progress: 0 },
  { id: '4', name: 'Day 4: Linear Algebra for ML', description: 'Learn about matrices, vectors, dot products, eigenvalues, and singular value decomposition (SVD).', status: 'not_started', estimatedHours: 4, resources: [{ name: '3Blue1Brown - Linear Algebra Series', type: 'video', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' }, { name: 'Essence of Linear Algebra', type: 'video', url: 'https://www.youtube.com/watch?v=fNk_zzaMoSs' }], children: ['Day 5: Calculus for ML'], depth: 1, progress: 0 },
  { id: '5', name: 'Day 5: Calculus for ML', description: 'Understand derivatives, gradients, and their importance in optimization algorithms like gradient descent.', status: 'not_started', estimatedHours: 3, resources: [{ name: 'Khan Academy - Derivatives', type: 'course', url: 'https://www.khanacademy.org/math/calculus-1/cs1-derivatives-definition-and-basic-rules' }, { name: 'Stanford CS229 Lecture Notes on Calculus', type: 'article', url: 'http://cs229.stanford.edu/notes/cs229-notes1.pdf' }], children: ['Day 6: Data Preprocessing & Cleaning'], depth: 1, progress: 0 },
  { id: '6', name: 'Day 6: Data Preprocessing & Cleaning', description: 'Techniques for handling missing values, feature scaling, normalization, and one-hot encoding.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'Hands-on Data Preprocessing (Kaggle)', type: 'course', url: 'https://www.kaggle.com/learn/data-cleaning' }, { name: 'Feature Engineering for Machine Learning (Coursera)', type: 'course', url: 'https://www.coursera.org/learn/feature-engineering' }], children: ['Day 7: Exploratory Data Analysis (EDA)'], depth: 1, progress: 0 },
  { id: '7', name: 'Day 7: Exploratory Data Analysis (EDA)', description: 'Use visualization tools to understand data distribution, relationships, and patterns.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'Seaborn Tutorial for EDA', type: 'article', url: 'https://seaborn.pydata.org/tutorial.html' }, { name: 'Python Data Visualization (Kaggle)', type: 'course', url: 'https://www.kaggle.com/learn/data-visualization' }], children: ['Day 8: Introduction to Supervised Learning'], depth: 1, progress: 0 },
  { id: '8', name: 'Day 8: Introduction to Supervised Learning', description: 'Overview of regression and classification problems.', status: 'not_started', estimatedHours: 3, resources: [{ name: 'Supervised vs Unsupervised Learning (IBM)', type: 'article', url: 'https://www.ibm.com/cloud/learn/supervised-learning' }, { name: 'Andrew Ng\'s Supervised Learning', type: 'video', url: 'https://www.coursera.org/lecture/machine-learning/supervised-machine-learning-regression-and-classification-6g-x0' }], children: ['Day 9: Linear Regression'], depth: 2, progress: 0 },
  { id: '9', name: 'Day 9: Linear Regression', description: 'Understand simple and multiple linear regression, cost function, and gradient descent.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'Linear Regression (StatQuest)', type: 'video', url: 'https://www.youtube.com/watch?v=nk2CQITm_eo' }, { name: 'Scikit-Learn Linear Regression', type: 'article', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html' }], children: ['Day 10: Logistic Regression'], depth: 2, progress: 0 },
  { id: '10', name: 'Day 10: Logistic Regression', description: 'Understand logistic regression for classification problems.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'Logistic Regression (StatQuest)', type: 'video', url: 'https://www.youtube.com/watch?v=yIYKR4sgzI8' }, { name: 'Logistic Regression in Scikit-Learn', type: 'article', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html' }], children: ['Day 11: Decision Trees & Random Forest'], depth: 2, progress: 0 },
  { id: '11', name: 'Day 11: Decision Trees & Random Forest', description: 'Learn about decision trees and ensemble learning using Random Forest.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'Decision Trees Explained', type: 'video', url: 'https://www.youtube.com/watch?v=7VeUPuFGJHk' }, { name: 'Scikit-Learn Decision Trees', type: 'article', url: 'https://scikit-learn.org/stable/modules/tree.html' }], children: ['Day 12: Support Vector Machines (SVM)'], depth: 2, progress: 0 },
  { id: '12', name: 'Day 12: Support Vector Machines (SVM)', description: 'Understand SVM, kernels, and hyperplane separation.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'StatQuest - SVM', type: 'video', url: 'https://www.youtube.com/watch?v=efR1C6CvhmE' }, { name: 'SVM in Python', type: 'article', url: 'https://scikit-learn.org/stable/modules/svm.html' }], children: ['Day 13: Model Evaluation & Metrics'], depth: 2, progress: 0 },
  { id: '13', name: 'Day 13: Model Evaluation & Metrics', description: 'Learn about accuracy, precision, recall, F1-score, and ROC curves.', status: 'not_started', estimatedHours: 3, resources: [{ name: 'Model Evaluation Metrics', type: 'article', url: 'https://www.analyticsvidhya.com/blog/2019/08/11-important-model-evaluation-metrics/' }, { name: 'Scikit-Learn Evaluation Metrics', type: 'article', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' }], children: ['Day 14: Hyperparameter Tuning & Optimization'], depth: 2, progress: 0 },
  { id: '14', name: 'Day 14: Hyperparameter Tuning & Optimization', description: 'Learn about Grid Search, Random Search, and Bayesian Optimization.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'Hyperparameter Optimization (Kaggle)', type: 'course', url: 'https://www.kaggle.com/learn/hyperparameter-tuning' }, { name: 'Grid Search vs Random Search', type: 'article', url: 'https://blog.usejournal.com/a-comparison-of-grid-search-and-randomized-search-using-scikit-learn-29823179bc85' }], children: ['Day 15: Introduction to Unsupervised Learning'], depth: 2, progress: 0 },
  { id: '15', name: 'Day 15: Introduction to Unsupervised Learning', description: 'Learn about clustering, anomaly detection, and dimensionality reduction.', status: 'not_started', estimatedHours: 3, resources: [{ name: 'Unsupervised Learning Overview (IBM)', type: 'article', url: 'https://www.ibm.com/cloud/learn/unsupervised-learning' }, { name: 'StatQuest - Clustering', type: 'video', url: 'https://www.youtube.com/watch?v=5zk93CpKYhg' }], children: ['Day 16: K-Means Clustering'], depth: 3, progress: 0 },
  { id: '16', name: 'Day 16: K-Means Clustering', description: 'Understand how K-Means works and its use cases.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'K-Means Clustering (StatQuest)', type: 'video', url: 'https://www.youtube.com/watch?v=4b5d3muPQmA' }, { name: 'Scikit-Learn K-Means', type: 'article', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html' }], children: ['Day 17: Principal Component Analysis (PCA)'], depth: 3, progress: 0 },
  { id: '17', name: 'Day 17: Principal Component Analysis (PCA)', description: 'Dimensionality reduction using PCA.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'PCA Explained (StatQuest)', type: 'video', url: 'https://www.youtube.com/watch?v=FgakZw6K1QQ' }, { name: 'Scikit-Learn PCA', type: 'article', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html' }], children: ['Day 18: Anomaly Detection'], depth: 3, progress: 0 },
  { id: '18', name: 'Day 18: Anomaly Detection', description: 'Learn how to detect outliers using Isolation Forest and One-Class SVM.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'Anomaly Detection Guide', type: 'article', url: 'https://www.analyticsvidhya.com/blog/2019/02/outlier-detection-python-pyod/' }, { name: 'Scikit-Learn Anomaly Detection', type: 'article', url: 'https://scikit-learn.org/stable/modules/outlier_detection.html' }], children: ['Day 19: Introduction to Neural Networks'], depth: 3, progress: 0 },
  { id: '19', name: 'Day 19: Introduction to Neural Networks', description: 'Learn about perceptrons, activation functions, forward propagation, and backpropagation.', status: 'not_started', estimatedHours: 4, resources: [{ name: 'Neural Networks Explained (3Blue1Brown)', type: 'video', url: 'https://www.youtube.com/watch?v=aircAruvnKk' }, { name: 'Introduction to Neural Networks (DeepLearning.AI)', type: 'course', url: 'https://www.coursera.org/learn/neural-networks-deep-learning' }], children: ['Day 20: Deep Learning Frameworks'], depth: 4, progress: 0 },
  { id: '20', name: 'Day 20: Deep Learning Frameworks', description: 'Explore TensorFlow and PyTorch for building deep learning models.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'TensorFlow 2.0 Tutorial', type: 'course', url: 'https://www.tensorflow.org/tutorials' }, { name: 'PyTorch Official Guide', type: 'article', url: 'https://pytorch.org/tutorials/' }], children: ['Day 21: Training a Neural Network'], depth: 4, progress: 0 },
  { id: '21', name: 'Day 21: Training a Neural Network', description: 'Learn how to train a simple feedforward neural network with backpropagation.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'Training Deep Learning Models (Kaggle)', type: 'course', url: 'https://www.kaggle.com/learn/intro-to-deep-learning' }, { name: 'Building a Neural Network from Scratch', type: 'article', url: 'https://medium.com/@curiousily/building-a-neural-network-from-scratch-in-python-8b6d2f5f2691' }], children: ['Day 22: Convolutional Neural Networks (CNNs)'], depth: 4, progress: 0 },
  { id: '22', name: 'Day 22: Convolutional Neural Networks (CNNs)', description: 'Learn about convolution layers, pooling layers, and CNN applications in image processing.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'CNNs Explained (Stanford)', type: 'article', url: 'http://cs231n.github.io/convolutional-networks/' }, { name: 'CNNs with Keras', type: 'article', url: 'https://keras.io/examples/vision/mnist_convnet/' }], children: ['Day 23: Recurrent Neural Networks (RNNs) & LSTMs'], depth: 4, progress: 0 },
  { id: '23', name: 'Day 23: Recurrent Neural Networks (RNNs) & LSTMs', description: 'Understand how RNNs handle sequential data like text and speech.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'Understanding LSTMs (Colah’s Blog)', type: 'article', url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/' }, { name: 'TensorFlow RNN Guide', type: 'article', url: 'https://www.tensorflow.org/guide/keras/rnn' }], children: ['Day 24: Natural Language Processing (NLP)'], depth: 4, progress: 0 },
  { id: '24', name: 'Day 24: Natural Language Processing (NLP)', description: 'Learn how to process text data, use embeddings, and build NLP models.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'NLP with spaCy', type: 'course', url: 'https://spacy.io/usage/spacy-101' }, { name: 'NLTK & Text Processing', type: 'article', url: 'https://www.nltk.org/book/' }], children: ['Day 25: Transformers & BERT'], depth: 4, progress: 0 },
  { id: '25', name: 'Day 25: Transformers & BERT', description: 'Learn about transformer models and pre-trained architectures like BERT.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'The Illustrated Transformer', type: 'article', url: 'http://jalammar.github.io/illustrated-transformer/' }, { name: 'Hugging Face Transformers', type: 'course', url: 'https://huggingface.co/course/chapter1/1' }], children: ['Day 26: Generative AI & GANs'], depth: 4, progress: 0 },
  { id: '26', name: 'Day 26: Generative AI & GANs', description: 'Understand how Generative Adversarial Networks (GANs) create synthetic data.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'GANs Explained (StatQuest)', type: 'video', url: 'https://www.youtube.com/watch?v=AALBGpLbjlo' }, { name: 'DeepLearning.AI Course on GANs', type: 'course', url: 'https://www.coursera.org/learn/build-basic-generative-adversarial-networks-gans' }], children: ['Day 27: Reinforcement Learning'], depth: 4, progress: 0 },
  { id: '27', name: 'Day 27: Reinforcement Learning', description: 'Learn about Markov Decision Processes, Q-learning, and policy gradients.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'Reinforcement Learning (DeepMind)', type: 'video', url: 'https://www.youtube.com/watch?v=2pWv7GOvuf0' }, { name: 'Introduction to RL (OpenAI)', type: 'article', url: 'https://spinningup.openai.com/en/latest/spinningup/rl_intro.html' }], children: ['Day 28: Model Deployment & APIs'], depth: 4, progress: 0 },
  { id: '28', name: 'Day 28: Model Deployment & APIs', description: 'Learn how to deploy ML models using Flask, FastAPI, or TensorFlow Serving.', status: 'not_started', estimatedHours: 5, resources: [{ name: 'Deploy ML Models with Flask', type: 'article', url: 'https://towardsdatascience.com/how-to-easily-deploy-machine-learning-models-using-flask-b95af8fe34d4' }, { name: 'FastAPI for ML Deployment', type: 'article', url: 'https://fastapi.tiangolo.com/' }], children: ['Day 29: ML Ethics & Bias'], depth: 4, progress: 0 },
  { id: '29', name: 'Day 29: ML Ethics & Bias', description: 'Understand ethical concerns, fairness in AI, and bias mitigation strategies.', status: 'not_started', estimatedHours: 3, resources: [{ name: 'AI Bias & Fairness (Google)', type: 'article', url: 'https://ai.google/responsibility/fairness/' }, { name: 'FairML: Auditing Black-Box Models', type: 'article', url: 'https://arxiv.org/abs/1810.07291' }], children: ['Day 30: Capstone Project & Next Steps'], depth: 4, progress: 0 },
  { id: '30', name: 'Day 30: Capstone Project & Next Steps', description: 'Apply what you\'ve learned to a hands-on project, such as image classification, text generation, or reinforcement learning.', status: 'not_started', estimatedHours: 10, resources: [{ name: 'Kaggle Competitions', type: 'course', url: 'https://www.kaggle.com/competitions' }, { name: 'Full ML Project Walkthrough', type: 'article', url: 'https://www.dataschool.io/how-to-build-a-machine-learning-project-from-scratch/' }], children: [], depth: 4, progress: 0 },
];

const SkillTree: React.FC<SkillTreeProps> = ({ skillMap }) => {
  // State for roadmap data
  const [roadmapData, setRoadmapData] = useState<SkillNode[]>(roadmap);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [nodeIndex, setNodeIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize nodes and edges from roadmap, centered
  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || 1200;
    const nodesPerRow = 10;
    const nodeSpacing = 250;
    const nodeSize = 200;
    const totalRowWidth = (nodesPerRow - 1) * nodeSpacing + nodeSize;
    const centerOffset = (totalRowWidth - containerWidth) / 2;

    const tempNodes: Node[] = [];
    const tempEdges: Edge[] = [];

    roadmapData.forEach((day, index) => {
      const i = index + 1;
      let x_pos = 0;
      let y_pos = 0;
      let s_pos = Position.Right;
      let t_pos = Position.Left;

      // Layout logic for 30 nodes, centered
      if (i <= 10) {
        x_pos = (i - 1) * nodeSpacing - centerOffset;
        y_pos = 100;
      } else if (i <= 20) {
        x_pos = (20 - i) * nodeSpacing - centerOffset;
        y_pos = 350;
      } else {
        x_pos = (i - 21) * nodeSpacing - centerOffset;
        y_pos = 600;
      }
      if (i === 10) {
        s_pos = Position.Bottom;
      } else if (i === 11) {
        t_pos = Position.Top;
        s_pos = Position.Left;
      } else if (i < 20 && i > 11) {
        s_pos = Position.Left;
        t_pos = Position.Right;
      } else if (i === 20) {
        s_pos = Position.Bottom;
        t_pos = Position.Right;
      } else if (i === 21) {
        t_pos = Position.Top;
        s_pos = Position.Right;
      }
      // Remove "Day X:" from the label
      const title = day.name.replace(/Day \d+:\s*/, '');

      // Determine border style based on status
      let borderStyle = '2px solid #ffffff';
      if (day.status === 'completed') {
        borderStyle = '3px solid #10B981'; // Green border for completed
      } else if (day.status === 'in_progress') {
        borderStyle = '3px solid #3B82F6'; // Blue border for in progress
      }

      tempNodes.push({
        id: day.id,
        position: { x: x_pos, y: y_pos },
        data: { 
          label: title,
          status: day.status  // Store status in node data
        },
        style: {
          backgroundColor: interpolateColor(i),
          color: '#fff',
          width: nodeSize,
          height: nodeSize,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          border: borderStyle,
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
          padding: '10px',
          textAlign: 'center',
          
        },
        draggable: true,
        sourcePosition: s_pos,
        targetPosition: t_pos,
      });

      // Add edges between consecutive nodes
      if (i > 1) {
        tempEdges.push({
          id: `e${i - 1}-${i}`,
          source: `${i - 1}`,
          target: `${i}`,
          animated: true,
          style: { stroke: '#666' },
        });
      }
    });

    setNodes(tempNodes);
    setEdges(tempEdges);
  }, [roadmapData]); // Depend on roadmapData instead of nothing

  // Handlers for node and edge updates
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // When a node is clicked, open the panel with roadmap data
  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    const nodeId = parseInt(node.id);
    const selectedDay = roadmapData[nodeId - 1]; // Adjust for 0-based index
    setSelectedNode(selectedDay);
    setNodeIndex(nodeId);
    setIsPanelOpen(true);
  };

  // Close the panel
  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleStatusChange = (nodeId: string, newStatus: 'completed' | 'in_progress' | 'not_started') => {
    // Update the roadmap data first
    const updatedRoadmap = roadmapData.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          status: newStatus
        };
      }
      return node;
    });
    
    setRoadmapData(updatedRoadmap);
    
    // Update the selected node if it's the one being changed
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        status: newStatus
      });
    }
    
    // Update the visual nodes with new status and styling
    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        let borderStyle = '2px solid #ffffff';
        if (newStatus === 'completed') {
          borderStyle = '3px solid #10B981'; // Green border for completed
        } else if (newStatus === 'in_progress') {
          borderStyle = '3px solid #3B82F6'; // Blue border for in progress
        }
        
        return {
          ...node,
          data: {
            ...node.data,
            status: newStatus
          },
          style: {
            ...node.style,
            border: borderStyle
          }
        };
      }
      return node;
    }));
  };

  return (
    <div ref={containerRef} className="bg-black/30 border border-purple-700/30 rounded-lg p-4 relative overflow-hidden">
      <div className="flex h-full">
        <div className="w-full flex flex-col md:flex-row relative">
          {/* React Flow Graph */}
          <div
            className={`${isPanelOpen ? 'md:w-2/3 lg:w-3/4' : 'w-full'} transition-all duration-300 ease-in-out`}
            style={{ height: '80vh' }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              style={{ background: '#111' }}
            >
              <MiniMap
                nodeColor={(node) => interpolateColor(parseInt(node.id))}
                nodeStrokeColor="#666"
                maskColor="rgba(255, 255, 255, 0.1)"
              />
              <Controls />
              <Background color="#333" gap={16} />
            </ReactFlow>
          </div>

          {/* Detail Panel for desktop */}
          <AnimatePresence>
            {isPanelOpen && selectedNode && !isMobile && (
              <motion.div
                className="hidden md:block md:w-1/3 lg:w-1/4 overflow-y-auto hide-scrollbar"
                style={{ maxHeight: '80vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900/90 to-black/90 backdrop-blur-sm border-b border-purple-700/30 p-3 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="bg-purple-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      {nodeIndex}
                    </span>
                    Skill Details
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClosePanel}
                    className="rounded-full h-8 w-8 hover:bg-purple-900/50"
                  >
                    <Minimize2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="p-4">
                  <NodeDetailPanel node={selectedNode} onStatusChange={handleStatusChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Layout */}
      {isMobile && (
        <Sheet open={isPanelOpen && isMobile} onOpenChange={setIsPanelOpen}>
          <SheetContent
            side="bottom"
            className="h-[90vh] p-0 border-t border-purple-700/50 bg-black/95"
          >
            <SheetHeader className="bg-gradient-to-r from-purple-900/90 to-black/90 p-3 border-b border-purple-700/30">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClosePanel}
                  className="rounded-full h-8 w-8 hover:bg-purple-900/50"
                >
                  <ArrowLeft className="h-4 w-4 text-white" />
                </Button>
                <SheetTitle className="text-white">Skill Details</SheetTitle>
                <div className="w-8"></div>
              </div>
            </SheetHeader>
            <div
              className="p-4 pb-24 hide-scrollbar"
              style={{
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                height: 'calc(90vh - 60px)',
              }}
            >
              {selectedNode && <NodeDetailPanel node={selectedNode} onStatusChange={handleStatusChange} />}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Draggable instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white text-sm border border-purple-700/50 z-10 pointer-events-none opacity-70">
        <span>Drag to explore • Scroll to zoom</span>
      </div>
    </div>
  );
};

export default SkillTree;