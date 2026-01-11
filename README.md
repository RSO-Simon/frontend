# Frontend

## Overview
This repository contains the React + TypeScript (Vite) frontend for the RSO project. It provides a UI for managing ships and components and authenticates users via Google Sign-In.

## Responsibilities
* Allow a user to login using their Google account
* Enable the user to view, edit, delete and create ships
* Enable the user to view, edit, delete and create components
* Enable the user to add or remove components to a specific ship.

## Services used
| Service           | Description                          |
|-------------------|--------------------------------------|
| auth-service      | User login and internal JWT token.   |
| ship-service      | Managing ships and their components. |
| component-service | Managing component templates.        |

## Deployment
The frontend is part of a cloud-native microservices system deployed on Azure Kubernetes Service (AKS) and integrated via Ingress-NGINX.

### Docker
The frontend is containerized and published to the GitHub Container Registry (GHCR).

### CI/CD
Continuous integration and continuous deployment (CI/CD) is implemented using GitHub Actions.
#### GitHub Actions pipeline:
* Build
* Test
* Build Docker image
* Push to GHCR
* Trigger infrastructure deployment