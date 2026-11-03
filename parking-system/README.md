# Parking System

--

## 📌 About
An Object-Oriented parking management system implemented in pure Java, focused on domain modeling, abstraction, and software architecture principles. It manages rotary vehicle entries and exits, category-based hourly rate tariffs, tolerance intervals, space occupancy tracking, and billing receipt generation without external libraries.

## 🚀 Technologies
- Java (JDK 11+)
- Object-Oriented Programming (Encapsulation, Aggregation, Composition)
- UML Class Modeling & Mermaid Diagrams
- Native Java Assertions & Unit Testing

## 🧠 What I learned
- Applying domain abstraction to isolate core business rules (license plates, categories, billing rules) from real-world extraneous noise.
- Translating formal UML class diagrams with multiplicity constraints into cohesive, decoupled Java classes.
- Implementing financial tariff business logic with configurable grace periods (15-minute tolerance) and commercial hourly rounding.
- Structuring terminal-based presentation modes and deterministic automated integration test batteries.

## ⚠️ Challenges
- **Domain Cohesion vs. Coupling:** Ensuring ticket billing calculations remain decoupled from physical parking spot allocation and vehicle definitions.
- **Precision in Temporal Calculations:** Accurately computing stay durations and prorated intervals across different vehicle category multipliers (Motorcycle, Car, SUV).
- **Concurrency & Edge Cases:** Preventing double-entry of active license plates and handling lot capacity saturation gracefully.

## 🔧 Improvements
- Implement a graphical user interface (GUI) using JavaFX or React web dashboard.
- Introduce persistent relational database storage (SQLite or PostgreSQL) replacing in-memory state.
- Add license plate recognition (ALPR) camera integration via an event-driven webhook.

## 🌎 About me
I am a Computer Science student in Brazil, focused on learning and continuous growth. I currently work at a technology company in the backend and automation field. I am still exploring different paths within technology to find my specialization, while developing practical projects and strengthening my foundation.
