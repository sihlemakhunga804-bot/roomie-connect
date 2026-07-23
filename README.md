# Roomie Connect

## Project Overview

Roomie Connect is a modern, frontend-heavy prototype for a South African roommate-finding platform. It is designed to facilitate connections between tenants seeking accommodation and landlords listing properties. The application focuses on providing a seamless user experience for both roles, from initial sign-up to managing listings and applications. Currently, it operates without a real backend database, utilizing hard-coded data and browser `localStorage` to simulate complex user flows.

## Tech Stack

This project is built with a contemporary web development stack, ensuring a responsive and dynamic user interface:

-   **TanStack Start:** A robust framework for building full-stack web applications.
-   **React 19:** The latest version of the popular JavaScript library for building user interfaces.
-   **Tailwind CSS v4:** A utility-first CSS framework for rapidly styling components.
-   **Zod:** A TypeScript-first schema declaration and validation library.
-   **React Hook Form:** A performant, flexible, and extensible form library for React.
-   **LocalStorage/SessionStorage:** Used for mock backend data persistence and session management in this prototype.

## Key Features

### 1. Multi-Step Sign-up Flow

A streamlined and intuitive sign-up process designed for both landlords and tenants:

-   **Welcome Screen:** Users select their role (Landlord or Tenant) to tailor their experience.
-   **Basic Info Entry:** Collects essential information such as Name/Nickname, Contact Number, and Password.
-   **Quick Verification:** A mock SMS verification step to confirm the contact number, activating the account upon successful code entry.
-   **Optional Profile Setup:** Allows landlords to add property names and tenants to set preferred locations or budgets, with the option to skip and complete later.
-   **Role-Based Dashboard Access:** Directs landlords to their property management dashboard and tenants to the browsing interface.

### 2. Phone-Based Login Flow

A unified and secure login experience:

-   **Role Selection:** Users choose their account type (Landlord or Tenant) before logging in.
-   **Phone Number Authentication:** Uses phone number and password for secure access.
-   **"Remember Me" Functionality:** Enhances user convenience for returning users.
-   **Role-Based Redirection:** Automatically navigates users to their respective dashboards post-login.

### 3. Password Recovery

A robust mechanism for account access recovery:

-   **Phone-Based Recovery:** Users can initiate password recovery using their registered phone number.
-   **Mock SMS Code Verification:** A recovery code is generated and can be verified to proceed.
-   **Password Reset:** Allows users to set a new password after successful verification.

### 4. Accessibility Improvements

Ensuring a more inclusive and user-friendly experience:

-   **`autocomplete` Attributes:** Implemented for form fields to improve browser autofill capabilities.
-   **`htmlFor` Associations:** Correctly linked labels to their respective form inputs for better screen reader support.

## Live Site

Experience Roomie Connect live:

[https://roomie-space.lovable.app](https://roomie-space.lovable.app)

## Preview Image

Below is a screenshot from the development console, highlighting some of the accessibility improvements and warnings addressed during development.

![Development Console Warnings](/home/ubuntu/upload/pasted_file_3q0pTg_image.png)
