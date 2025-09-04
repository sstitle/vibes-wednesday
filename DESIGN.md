# Vibes Wednesday

## Overview

The Vibes Wednesday project aims to create an interactive 3D visualization tool that allows users to generate and view 3D meshes based on their textual input. The system will leverage advanced AI models for both natural language processing and 3D model generation.

## Key Components

1. **Agentic Workflow**: 
   - Utilize Langchain to manage the workflow of agents responsible for processing user input and generating 3D meshes.

2. **Front-End Interface**:
   - Develop a user-friendly interface that displays 3D meshes based on user input. The interface will allow users to interact with the 3D view through panning, orbiting, and zooming.

3. **Chatbot Integration**:
   - Implement a chatbot using Python and Huggingface models to collect and aggregate user input regarding their desired 3D mesh.

4. **3D Model Generation**:
   - Use the 'Zhengyi/LLaMA-Mesh' model from Huggingface for converting text descriptions into 3D models.

## Workflow

1. **User Interaction**:
   - Users provide a description of the desired 3D model through a chat interface.
   - The system will prompt users with additional questions to gather sufficient information for mesh generation.

2. **Mesh Generation**:
   - Once enough information is collected, the system generates a 3D mesh using the selected model.

3. **Display**:
   - The generated mesh is displayed in a 3D view. Initially, a "Hello World" text mesh will be shown as a placeholder.

## User Interface Guidelines

- The interface will consist of two main panes: a user input pane and a 3D canvas display pane.
- Users should be able to interact with the 3D view, including panning, orbiting, and zooming the camera to explore the generated mesh.
