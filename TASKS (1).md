# 📋 Tâches du Projet Emi

> **"Le sourire d'opérations réussies"**

## Informations Générales

| Propriété | Valeur |
|-----------|--------|
| **Nom du projet** | Emi |
| **Slogan** | Le sourire d'opérations réussies |
| **Description** | Application de gestion de business commerciaux |
| **Stack Backend** | AdonisJS 6, PostgreSQL, Redis |
| **Stack Frontend** | React 18 + TypeScript + TailwindCSS |
| **Stockage fichiers** | AWS S3 |
| **Notifications** | SMTP Email |

---

## 📊 Légende

### Priorités
- 🔴 **CRITIQUE** - Bloquant pour la suite
- 🟠 **HAUTE** - Important pour le MVP
- 🟡 **MOYENNE** - Nécessaire mais non bloquant
- 🟢 **BASSE** - Nice to have

### Statuts
- ⬜ À faire
- 🔄 En cours
- ✅ Terminé
- ⏸️ Bloqué
- 🔍 En revue

---

## Phase 1 : Fondations et Configuration

### 1.1 Initialisation du Projet

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| F1-001 | Créer le repository Git avec structure de base | @DevOpsExpert | 🔴 | ⬜ | - | 1h |
| F1-002 | Initialiser le projet AdonisJS 6 | @BackendExpert | 🔴 | ⬜ | F1-001 | 2h |
| F1-003 | Configurer TypeScript strict mode | @BackendExpert | 🔴 | ⬜ | F1-002 | 1h |
| F1-004 | Configurer ESLint + Prettier | @BackendExpert | 🟠 | ⬜ | F1-002 | 1h |
| F1-005 | Créer le fichier .env.example | @BackendExpert | 🔴 | ⬜ | F1-002 | 30min |
| F1-006 | Configurer Docker pour développement | @DevOpsExpert | 🟠 | ⬜ | F1-002 | 3h |
| F1-007 | Créer docker-compose (PostgreSQL, Redis) | @DevOpsExpert | 🔴 | ⬜ | F1-006 | 2h |

### 1.2 Configuration Base de Données

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| F1-008 | Configurer la connexion PostgreSQL | @DatabaseArchitect | 🔴 | ⬜ | F1-007 | 1h |
| F1-009 | Configurer Lucid ORM | @DatabaseArchitect | 🔴 | ⬜ | F1-008 | 1h |
| F1-010 | Créer le schéma de base de données (diagramme) | @DatabaseArchitect | 🔴 | ⬜ | - | 4h |
| F1-011 | Documenter les conventions de nommage BDD | @DatabaseArchitect | 🟠 | ⬜ | F1-010 | 1h |

### 1.3 Configuration Services Externes

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| F1-012 | Configurer Redis pour le cache | @BackendExpert | 🟠 | ⬜ | F1-007 | 2h |
| F1-013 | Créer le service de cache avec Redis | @BackendExpert | 🟠 | ⬜ | F1-012 | 3h |
| F1-014 | Configurer AWS S3 (client) | @BackendExpert | 🟠 | ⬜ | F1-002 | 2h |
| F1-015 | Créer le service d'upload S3 | @BackendExpert | 🟠 | ⬜ | F1-014 | 4h |
| F1-016 | Configurer le service SMTP | @BackendExpert | 🟡 | ⬜ | F1-002 | 2h |
| F1-017 | Créer le service d'envoi d'emails | @BackendExpert | 🟡 | ⬜ | F1-016 | 3h |
| F1-018 | Créer les templates d'emails de base | @BackendExpert | 🟡 | ⬜ | F1-017 | 2h |

---

## Phase 2 : Modèles de Données

### 2.1 Modèles Principaux

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| M2-001 | Migration : table `organizations` | @DatabaseArchitect | 🔴 | ⬜ | F1-009 | 1h |
| M2-002 | Modèle `Organization` | @BackendExpert | 🔴 | ⬜ | M2-001 | 2h |
| M2-003 | Migration : table `businesses` | @DatabaseArchitect | 🔴 | ⬜ | M2-001 | 2h |
| M2-004 | Modèle `Business` (avec champ `supports_rotations`) | @BackendExpert | 🔴 | ⬜ | M2-003 | 3h |
| M2-005 | Migration : table `users` | @DatabaseArchitect | 🔴 | ⬜ | M2-001 | 2h |
| M2-006 | Modèle `User` avec profil complet | @BackendExpert | 🔴 | ⬜ | M2-005 | 4h |
| M2-007 | Migration : table pivot `business_users` | @DatabaseArchitect | 🔴 | ⬜ | M2-003, M2-005 | 2h |
| M2-008 | Modèle `BusinessUser` avec rôles | @BackendExpert | 🔴 | ⬜ | M2-007 | 3h |

### 2.2 Modèles Financiers

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| M2-009 | Migration : table `transactions` | @DatabaseArchitect | 🔴 | ⬜ | M2-003 | 2h |
| M2-010 | Modèle `Transaction` (entrées/sorties) | @BackendExpert | 🔴 | ⬜ | M2-009 | 4h |
| M2-011 | Migration : table `transaction_categories` | @DatabaseArchitect | 🟠 | ⬜ | M2-003 | 1h |
| M2-012 | Modèle `TransactionCategory` | @BackendExpert | 🟠 | ⬜ | M2-011 | 2h |
| M2-013 | Migration : table `transaction_attachments` | @DatabaseArchitect | 🟠 | ⬜ | M2-009 | 1h |
| M2-014 | Modèle `TransactionAttachment` | @BackendExpert | 🟠 | ⬜ | M2-013 | 2h |
| M2-015 | Système d'IDs incrémentaux (ENT-XXXX, SOR-XXXX) | @BackendExpert | 🟡 | ⬜ | M2-010 | 3h |

### 2.3 Modèles Stock

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| M2-016 | Migration : table `stock_items` | @DatabaseArchitect | 🔴 | ⬜ | M2-003 | 2h |
| M2-017 | Modèle `StockItem` | @BackendExpert | 🔴 | ⬜ | M2-016 | 3h |
| M2-018 | Migration : table `stock_movements` | @DatabaseArchitect | 🔴 | ⬜ | M2-016 | 2h |
| M2-019 | Modèle `StockMovement` | @BackendExpert | 🔴 | ⬜ | M2-018 | 3h |

### 2.4 Modèles Ventes

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| M2-020 | Migration : table `customers` | @DatabaseArchitect | 🔴 | ⬜ | M2-003 | 2h |
| M2-021 | Modèle `Customer` | @BackendExpert | 🔴 | ⬜ | M2-020 | 3h |
| M2-022 | Migration : table `suppliers` | @DatabaseArchitect | 🔴 | ⬜ | M2-003 | 1h |
| M2-023 | Modèle `Supplier` | @BackendExpert | 🔴 | ⬜ | M2-022 | 2h |
| M2-024 | Migration : table `sales` | @DatabaseArchitect | 🔴 | ⬜ | M2-020 | 2h |
| M2-025 | Modèle `Sale` | @BackendExpert | 🔴 | ⬜ | M2-024 | 4h |
| M2-026 | Migration : table `sale_items` | @DatabaseArchitect | 🔴 | ⬜ | M2-024, M2-016 | 2h |
| M2-027 | Modèle `SaleItem` | @BackendExpert | 🔴 | ⬜ | M2-026 | 2h |
| M2-028 | Migration : table `sale_payments` | @DatabaseArchitect | 🔴 | ⬜ | M2-024 | 1h |
| M2-029 | Modèle `SalePayment` (paiements partiels) | @BackendExpert | 🔴 | ⬜ | M2-028 | 3h |
| M2-030 | Système d'IDs incrémentaux ventes (VTE-XXXX) | @BackendExpert | 🟡 | ⬜ | M2-025 | 2h |

### 2.5 Modèles Rotations (Conditionnel)

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| M2-031 | Migration : table `rotations` | @DatabaseArchitect | 🟠 | ⬜ | M2-003 | 2h |
| M2-032 | Modèle `Rotation` | @BackendExpert | 🟠 | ⬜ | M2-031 | 4h |
| M2-033 | Ajouter `rotation_id` nullable aux transactions | @DatabaseArchitect | 🟠 | ⬜ | M2-031, M2-009 | 1h |
| M2-034 | Ajouter `rotation_id` nullable aux ventes | @DatabaseArchitect | 🟠 | ⬜ | M2-031, M2-024 | 1h |
| M2-035 | Migration : table `rotation_closures` | @DatabaseArchitect | 🟡 | ⬜ | M2-031 | 1h |
| M2-036 | Modèle `RotationClosure` | @BackendExpert | 🟡 | ⬜ | M2-035 | 3h |

### 2.6 Seeds et Factories

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| M2-037 | Factory `Organization` | @BackendExpert | 🟡 | ⬜ | M2-002 | 30min |
| M2-038 | Factory `Business` | @BackendExpert | 🟡 | ⬜ | M2-004 | 30min |
| M2-039 | Factory `User` | @BackendExpert | 🟡 | ⬜ | M2-006 | 30min |
| M2-040 | Factory `Customer` | @BackendExpert | 🟡 | ⬜ | M2-021 | 30min |
| M2-041 | Factory `Transaction` | @BackendExpert | 🟡 | ⬜ | M2-010 | 30min |
| M2-042 | Factory `Sale` | @BackendExpert | 🟡 | ⬜ | M2-025 | 30min |
| M2-043 | Seeder de développement complet | @BackendExpert | 🟡 | ⬜ | M2-037 à M2-042 | 2h |

---

## Phase 3 : Authentification et Sécurité

### 3.1 Authentification

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| A3-001 | Configurer AdonisJS Auth | @BackendExpert | 🔴 | ⬜ | M2-006 | 2h |
| A3-002 | Endpoint POST /auth/login | @BackendExpert | 🔴 | ⬜ | A3-001 | 2h |
| A3-003 | Endpoint POST /auth/logout | @BackendExpert | 🔴 | ⬜ | A3-001 | 1h |
| A3-004 | Endpoint POST /auth/forgot-password | @BackendExpert | 🟠 | ⬜ | A3-001, F1-017 | 3h |
| A3-005 | Endpoint POST /auth/reset-password | @BackendExpert | 🟠 | ⬜ | A3-004 | 2h |
| A3-006 | Endpoint GET /auth/me | @BackendExpert | 🔴 | ⬜ | A3-001 | 1h |
| A3-007 | Endpoint PUT /auth/profile | @BackendExpert | 🟠 | ⬜ | A3-001 | 2h |
| A3-008 | Fonction de génération de mot de passe | @BackendExpert | 🟡 | ⬜ | - | 1h |
| A3-009 | Email de bienvenue avec credentials | @BackendExpert | 🟡 | ⬜ | F1-017, A3-008 | 2h |

### 3.2 Système de Permissions (RBAC)

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| A3-010 | Définir les rôles et permissions | @LeadArchitect | 🔴 | ⬜ | - | 2h |
| A3-011 | Migration : table `roles` | @DatabaseArchitect | 🔴 | ⬜ | A3-010 | 1h |
| A3-012 | Migration : table `permissions` | @DatabaseArchitect | 🔴 | ⬜ | A3-010 | 1h |
| A3-013 | Modèle `Role` | @BackendExpert | 🔴 | ⬜ | A3-011 | 2h |
| A3-014 | Modèle `Permission` | @BackendExpert | 🔴 | ⬜ | A3-012 | 2h |
| A3-015 | Middleware `CheckPermission` | @BackendExpert | 🔴 | ⬜ | A3-013, A3-014 | 4h |
| A3-016 | Middleware `CheckBusinessAccess` | @BackendExpert | 🔴 | ⬜ | M2-008 | 3h |
| A3-017 | Middleware `CheckOrganizationAccess` | @BackendExpert | 🔴 | ⬜ | M2-002 | 2h |
| A3-018 | Service `PermissionService` | @BackendExpert | 🔴 | ⬜ | A3-015 | 4h |
| A3-019 | Seeder des rôles par défaut | @BackendExpert | 🟠 | ⬜ | A3-013 | 1h |

### 3.3 Isolation des Données

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| A3-020 | Scope global `BusinessScope` sur Lucid | @BackendExpert | 🔴 | ⬜ | M2-004 | 4h |
| A3-021 | Filtrage automatique par business_id | @BackendExpert | 🔴 | ⬜ | A3-020 | 3h |
| A3-022 | Filtrage ventes du jour pour rôle "sales" | @BackendExpert | 🔴 | ⬜ | A3-018, M2-025 | 3h |
| A3-023 | Tests de sécurité isolation des données | @QAEngineer | 🔴 | ⬜ | A3-020 à A3-022 | 4h |

---

## Phase 4 : API - Gestion des Organisations et Business

### 4.1 Organisations (Super Admin)

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| O4-001 | Controller `OrganizationsController` | @BackendExpert | 🔴 | ⬜ | M2-002 | 1h |
| O4-002 | Endpoint GET /organizations | @BackendExpert | 🔴 | ⬜ | O4-001 | 1h |
| O4-003 | Endpoint GET /organizations/:id | @BackendExpert | 🔴 | ⬜ | O4-001 | 1h |
| O4-004 | Endpoint PUT /organizations/:id | @BackendExpert | 🟠 | ⬜ | O4-001 | 2h |

### 4.2 Businesses

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| O4-005 | Controller `BusinessesController` | @BackendExpert | 🔴 | ⬜ | M2-004 | 1h |
| O4-006 | Endpoint GET /businesses | @BackendExpert | 🔴 | ⬜ | O4-005 | 2h |
| O4-007 | Endpoint POST /businesses | @BackendExpert | 🔴 | ⬜ | O4-005 | 3h |
| O4-008 | Endpoint GET /businesses/:id | @BackendExpert | 🔴 | ⬜ | O4-005 | 1h |
| O4-009 | Endpoint PUT /businesses/:id | @BackendExpert | 🟠 | ⬜ | O4-005 | 2h |
| O4-010 | Endpoint DELETE /businesses/:id | @BackendExpert | 🟠 | ⬜ | O4-005 | 2h |
| O4-011 | Endpoint GET /businesses/:id/switch (changer de business) | @BackendExpert | 🔴 | ⬜ | O4-005 | 2h |
| O4-012 | Validation création business (type standard/rotation) | @BackendExpert | 🔴 | ⬜ | O4-007 | 1h |

### 4.3 Gestion des Utilisateurs (Admin)

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| O4-013 | Controller `UsersController` | @BackendExpert | 🔴 | ⬜ | M2-006 | 1h |
| O4-014 | Endpoint GET /users | @BackendExpert | 🔴 | ⬜ | O4-013 | 2h |
| O4-015 | Endpoint POST /users | @BackendExpert | 🔴 | ⬜ | O4-013, A3-008 | 4h |
| O4-016 | Endpoint GET /users/:id | @BackendExpert | 🔴 | ⬜ | O4-013 | 1h |
| O4-017 | Endpoint PUT /users/:id | @BackendExpert | 🟠 | ⬜ | O4-013 | 2h |
| O4-018 | Endpoint DELETE /users/:id | @BackendExpert | 🟠 | ⬜ | O4-013 | 2h |
| O4-019 | Endpoint POST /users/:id/reset-password | @BackendExpert | 🟠 | ⬜ | O4-013, A3-008 | 2h |
| O4-020 | Endpoint POST /users/:id/assign-business | @BackendExpert | 🔴 | ⬜ | O4-013, M2-008 | 3h |
| O4-021 | Endpoint DELETE /users/:id/remove-business/:businessId | @BackendExpert | 🟠 | ⬜ | O4-020 | 2h |

---

## Phase 5 : API - Transactions Financières

### 5.1 Entrées d'Argent

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| T5-001 | Controller `IncomesController` | @BackendExpert | 🔴 | ⬜ | M2-010 | 1h |
| T5-002 | Service `IncomeService` | @BackendExpert | 🔴 | ⬜ | M2-010 | 3h |
| T5-003 | Endpoint GET /incomes | @BackendExpert | 🔴 | ⬜ | T5-001 | 2h |
| T5-004 | Endpoint POST /incomes | @BackendExpert | 🔴 | ⬜ | T5-001, T5-002 | 3h |
| T5-005 | Endpoint GET /incomes/:id | @BackendExpert | 🔴 | ⬜ | T5-001 | 1h |
| T5-006 | Endpoint PUT /incomes/:id | @BackendExpert | 🟠 | ⬜ | T5-001 | 2h |
| T5-007 | Endpoint DELETE /incomes/:id | @BackendExpert | 🟠 | ⬜ | T5-001 | 2h |
| T5-008 | Filtres : date, montant, catégorie | @BackendExpert | 🟠 | ⬜ | T5-003 | 2h |

### 5.2 Sorties d'Argent

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| T5-009 | Controller `ExpensesController` | @BackendExpert | 🔴 | ⬜ | M2-010 | 1h |
| T5-010 | Service `ExpenseService` | @BackendExpert | 🔴 | ⬜ | M2-010 | 4h |
| T5-011 | Endpoint GET /expenses | @BackendExpert | 🔴 | ⬜ | T5-009 | 2h |
| T5-012 | Endpoint POST /expenses | @BackendExpert | 🔴 | ⬜ | T5-009, T5-010 | 3h |
| T5-013 | Endpoint GET /expenses/:id | @BackendExpert | 🔴 | ⬜ | T5-009 | 1h |
| T5-014 | Endpoint PUT /expenses/:id | @BackendExpert | 🟠 | ⬜ | T5-009 | 2h |
| T5-015 | Endpoint DELETE /expenses/:id | @BackendExpert | 🟠 | ⬜ | T5-009 | 2h |
| T5-016 | Endpoint POST /expenses/:id/attachments | @BackendExpert | 🟠 | ⬜ | T5-009, F1-015 | 3h |
| T5-017 | Endpoint DELETE /expenses/:id/attachments/:attachmentId | @BackendExpert | 🟡 | ⬜ | T5-016 | 1h |
| T5-018 | Gestion des catégories de sorties | @BackendExpert | 🟠 | ⬜ | M2-012 | 2h |
| T5-019 | Enregistrement du bénéficiaire | @BackendExpert | 🟡 | ⬜ | T5-012 | 2h |

### 5.3 Catégories de Transactions

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| T5-020 | Controller `TransactionCategoriesController` | @BackendExpert | 🟠 | ⬜ | M2-012 | 1h |
| T5-021 | Endpoint GET /transaction-categories | @BackendExpert | 🟠 | ⬜ | T5-020 | 1h |
| T5-022 | Endpoint POST /transaction-categories | @BackendExpert | 🟡 | ⬜ | T5-020 | 2h |
| T5-023 | Seeder catégories par défaut | @BackendExpert | 🟠 | ⬜ | M2-012 | 1h |

---

## Phase 6 : API - Stock

### 6.1 Articles en Stock

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| S6-001 | Controller `StockItemsController` | @BackendExpert | 🔴 | ⬜ | M2-017 | 1h |
| S6-002 | Service `StockService` | @BackendExpert | 🔴 | ⬜ | M2-017, M2-019 | 4h |
| S6-003 | Endpoint GET /stock-items | @BackendExpert | 🔴 | ⬜ | S6-001 | 2h |
| S6-004 | Endpoint POST /stock-items | @BackendExpert | 🔴 | ⬜ | S6-001, S6-002 | 3h |
| S6-005 | Endpoint GET /stock-items/:id | @BackendExpert | 🔴 | ⬜ | S6-001 | 1h |
| S6-006 | Endpoint PUT /stock-items/:id | @BackendExpert | 🟠 | ⬜ | S6-001 | 2h |
| S6-007 | Endpoint DELETE /stock-items/:id | @BackendExpert | 🟠 | ⬜ | S6-001 | 2h |
| S6-008 | Endpoint GET /stock-items/:id/movements | @BackendExpert | 🟠 | ⬜ | S6-001, M2-019 | 2h |

### 6.2 Mouvements de Stock

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| S6-009 | Controller `StockMovementsController` | @BackendExpert | 🔴 | ⬜ | M2-019 | 1h |
| S6-010 | Endpoint POST /stock-movements (entrée) | @BackendExpert | 🔴 | ⬜ | S6-009, S6-002 | 3h |
| S6-011 | Endpoint POST /stock-movements (sortie) | @BackendExpert | 🔴 | ⬜ | S6-009, S6-002 | 3h |
| S6-012 | Endpoint GET /stock-movements | @BackendExpert | 🟠 | ⬜ | S6-009 | 2h |
| S6-013 | Calcul automatique quantité disponible | @BackendExpert | 🔴 | ⬜ | S6-002 | 3h |
| S6-014 | Alertes stock bas (seuil configurable) | @BackendExpert | 🟡 | ⬜ | S6-002, F1-017 | 3h |

---

## Phase 7 : API - Ventes

### 7.1 Clients

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| V7-001 | Controller `CustomersController` | @BackendExpert | 🔴 | ⬜ | M2-021 | 1h |
| V7-002 | Endpoint GET /customers | @BackendExpert | 🔴 | ⬜ | V7-001 | 2h |
| V7-003 | Endpoint POST /customers (enregistrement rapide) | @BackendExpert | 🔴 | ⬜ | V7-001 | 2h |
| V7-004 | Endpoint GET /customers/:id | @BackendExpert | 🔴 | ⬜ | V7-001 | 1h |
| V7-005 | Endpoint PUT /customers/:id | @BackendExpert | 🟠 | ⬜ | V7-001 | 2h |
| V7-006 | Endpoint DELETE /customers/:id | @BackendExpert | 🟠 | ⬜ | V7-001 | 1h |
| V7-007 | Endpoint GET /customers/:id/purchases | @BackendExpert | 🟠 | ⬜ | V7-001, M2-025 | 2h |
| V7-008 | Endpoint GET /customers/:id/balance | @BackendExpert | 🔴 | ⬜ | V7-001, M2-025 | 2h |
| V7-009 | Endpoint GET /customers/:id/stats | @BackendExpert | 🟡 | ⬜ | V7-001 | 3h |

### 7.2 Fournisseurs

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| V7-010 | Controller `SuppliersController` | @BackendExpert | 🔴 | ⬜ | M2-023 | 1h |
| V7-011 | Endpoint GET /suppliers | @BackendExpert | 🔴 | ⬜ | V7-010 | 2h |
| V7-012 | Endpoint POST /suppliers | @BackendExpert | 🔴 | ⬜ | V7-010 | 2h |
| V7-013 | Endpoint GET /suppliers/:id | @BackendExpert | 🔴 | ⬜ | V7-010 | 1h |
| V7-014 | Endpoint PUT /suppliers/:id | @BackendExpert | 🟠 | ⬜ | V7-010 | 2h |
| V7-015 | Endpoint DELETE /suppliers/:id | @BackendExpert | 🟠 | ⬜ | V7-010 | 1h |
| V7-016 | Endpoint GET /suppliers/:id/transactions | @BackendExpert | 🟡 | ⬜ | V7-010, M2-010 | 2h |

### 7.3 Ventes

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| V7-017 | Controller `SalesController` | @BackendExpert | 🔴 | ⬜ | M2-025 | 1h |
| V7-018 | Service `SaleService` | @BackendExpert | 🔴 | ⬜ | M2-025, M2-027, M2-029 | 6h |
| V7-019 | Endpoint GET /sales | @BackendExpert | 🔴 | ⬜ | V7-017 | 2h |
| V7-020 | Endpoint POST /sales (vente cash) | @BackendExpert | 🔴 | ⬜ | V7-017, V7-018 | 4h |
| V7-021 | Endpoint POST /sales (vente crédit) | @BackendExpert | 🔴 | ⬜ | V7-017, V7-018 | 4h |
| V7-022 | Endpoint GET /sales/:id | @BackendExpert | 🔴 | ⬜ | V7-017 | 1h |
| V7-023 | Endpoint PUT /sales/:id | @BackendExpert | 🟠 | ⬜ | V7-017 | 2h |
| V7-024 | Endpoint DELETE /sales/:id | @BackendExpert | 🟠 | ⬜ | V7-017 | 2h |
| V7-025 | Endpoint POST /sales/:id/payments | @BackendExpert | 🔴 | ⬜ | V7-017, M2-029 | 3h |
| V7-026 | Endpoint GET /sales/:id/payments | @BackendExpert | 🟠 | ⬜ | V7-025 | 1h |
| V7-027 | Déduction automatique du stock | @BackendExpert | 🔴 | ⬜ | V7-018, S6-002 | 3h |
| V7-028 | Filtres : date, client, statut, type | @BackendExpert | 🟠 | ⬜ | V7-019 | 2h |

---

## Phase 8 : API - Rotations (Business avec rotations uniquement)

### 8.1 Gestion des Rotations

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| R8-001 | Middleware `CheckRotationSupport` | @BackendExpert | 🔴 | ⬜ | M2-004 | 2h |
| R8-002 | Controller `RotationsController` | @BackendExpert | 🔴 | ⬜ | M2-032, R8-001 | 1h |
| R8-003 | Service `RotationService` | @BackendExpert | 🔴 | ⬜ | M2-032 | 5h |
| R8-004 | Endpoint GET /rotations | @BackendExpert | 🔴 | ⬜ | R8-002 | 2h |
| R8-005 | Endpoint POST /rotations | @BackendExpert | 🔴 | ⬜ | R8-002, R8-003 | 3h |
| R8-006 | Endpoint GET /rotations/:id | @BackendExpert | 🔴 | ⬜ | R8-002 | 1h |
| R8-007 | Endpoint PUT /rotations/:id | @BackendExpert | 🟠 | ⬜ | R8-002 | 2h |
| R8-008 | Endpoint DELETE /rotations/:id | @BackendExpert | 🟠 | ⬜ | R8-002 | 2h |

### 8.2 Liaison aux Rotations

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| R8-009 | Endpoint GET /rotations/:id/expenses | @BackendExpert | 🟠 | ⬜ | R8-002, M2-033 | 2h |
| R8-010 | Endpoint GET /rotations/:id/sales | @BackendExpert | 🟠 | ⬜ | R8-002, M2-034 | 2h |
| R8-011 | Endpoint GET /rotations/:id/summary | @BackendExpert | 🔴 | ⬜ | R8-003 | 3h |
| R8-012 | Calcul profit/perte par rotation | @BackendExpert | 🔴 | ⬜ | R8-003 | 4h |

### 8.3 Clôture de Rotation

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| R8-013 | Endpoint GET /rotations/:id/closure-checklist | @BackendExpert | 🔴 | ⬜ | R8-003 | 3h |
| R8-014 | Endpoint POST /rotations/:id/close | @BackendExpert | 🔴 | ⬜ | R8-003, M2-036 | 4h |
| R8-015 | Validation pré-clôture (stock, argent, etc.) | @BackendExpert | 🔴 | ⬜ | R8-013 | 4h |
| R8-016 | Blocage modifications après clôture | @BackendExpert | 🔴 | ⬜ | R8-014 | 2h |
| R8-017 | Endpoint POST /rotations/:id/reopen (super admin) | @BackendExpert | 🟡 | ⬜ | R8-014 | 2h |

---

## Phase 9 : API - Analytics et Rapports

### 9.1 Dashboard

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| D9-001 | Controller `DashboardController` | @BackendExpert | 🔴 | ⬜ | - | 1h |
| D9-002 | Service `AnalyticsService` | @BackendExpert | 🔴 | ⬜ | - | 6h |
| D9-003 | Endpoint GET /dashboard/summary | @BackendExpert | 🔴 | ⬜ | D9-001, D9-002 | 3h |
| D9-004 | Endpoint GET /dashboard/sales-chart | @BackendExpert | 🔴 | ⬜ | D9-001, D9-002 | 3h |
| D9-005 | Endpoint GET /dashboard/income-expense-chart | @BackendExpert | 🔴 | ⬜ | D9-001, D9-002 | 3h |
| D9-006 | Endpoint GET /dashboard/top-customers | @BackendExpert | 🟠 | ⬜ | D9-001, D9-002 | 2h |
| D9-007 | Endpoint GET /dashboard/top-products | @BackendExpert | 🟠 | ⬜ | D9-001, D9-002 | 2h |
| D9-008 | Endpoint GET /dashboard/rotation-performance | @BackendExpert | 🟠 | ⬜ | D9-001, D9-002, R8-001 | 3h |
| D9-009 | Endpoint GET /dashboard/credit-status | @BackendExpert | 🟠 | ⬜ | D9-001, D9-002 | 2h |

### 9.2 Rapports

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| D9-010 | Service `ReportService` | @BackendExpert | 🟠 | ⬜ | - | 4h |
| D9-011 | Endpoint GET /reports/sales | @BackendExpert | 🟠 | ⬜ | D9-010 | 3h |
| D9-012 | Endpoint GET /reports/financial | @BackendExpert | 🟠 | ⬜ | D9-010 | 3h |
| D9-013 | Endpoint GET /reports/stock | @BackendExpert | 🟠 | ⬜ | D9-010 | 2h |
| D9-014 | Endpoint GET /reports/customers | @BackendExpert | 🟡 | ⬜ | D9-010 | 2h |
| D9-015 | Export PDF des rapports | @BackendExpert | 🟡 | ⬜ | D9-010 | 4h |
| D9-016 | Export Excel des rapports | @BackendExpert | 🟡 | ⬜ | D9-010 | 4h |

### 9.3 Clôture Mensuelle

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| D9-017 | Migration : table `monthly_closures` | @DatabaseArchitect | 🟠 | ⬜ | M2-003 | 1h |
| D9-018 | Modèle `MonthlyClosure` | @BackendExpert | 🟠 | ⬜ | D9-017 | 2h |
| D9-019 | Endpoint GET /closures/monthly/:year/:month/checklist | @BackendExpert | 🟠 | ⬜ | D9-018 | 3h |
| D9-020 | Endpoint POST /closures/monthly/:year/:month/close | @BackendExpert | 🟠 | ⬜ | D9-018 | 4h |

---

## Phase 10 : API - Notifications

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| N10-001 | Service `NotificationService` | @BackendExpert | 🟠 | ⬜ | F1-017 | 4h |
| N10-002 | Template email : nouveau utilisateur | @BackendExpert | 🟡 | ⬜ | N10-001 | 1h |
| N10-003 | Template email : réinitialisation mot de passe | @BackendExpert | 🟠 | ⬜ | N10-001 | 1h |
| N10-004 | Template email : rappel créance | @BackendExpert | 🟡 | ⬜ | N10-001 | 1h |
| N10-005 | Template email : alerte stock bas | @BackendExpert | 🟡 | ⬜ | N10-001 | 1h |
| N10-006 | Template email : clôture rotation | @BackendExpert | 🟡 | ⬜ | N10-001 | 1h |
| N10-007 | Endpoint POST /notifications/test-email | @BackendExpert | 🟡 | ⬜ | N10-001 | 1h |
| N10-008 | Configuration préférences notifications par utilisateur | @BackendExpert | 🟡 | ⬜ | N10-001, M2-006 | 3h |

---

## Phase 11 : Frontend - Configuration

### 11.1 Initialisation

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE11-001 | Initialiser projet React + TypeScript + Vite | @FrontendExpert | 🔴 | ⬜ | - | 2h |
| FE11-002 | Configurer TailwindCSS | @FrontendExpert | 🔴 | ⬜ | FE11-001 | 1h |
| FE11-003 | Configurer ESLint + Prettier frontend | @FrontendExpert | 🟠 | ⬜ | FE11-001 | 1h |
| FE11-004 | Configurer React Router | @FrontendExpert | 🔴 | ⬜ | FE11-001 | 1h |
| FE11-005 | Configurer Zustand (state management) | @FrontendExpert | 🔴 | ⬜ | FE11-001 | 2h |
| FE11-006 | Configurer React Query (data fetching) | @FrontendExpert | 🔴 | ⬜ | FE11-001 | 2h |
| FE11-007 | Créer service API (axios/fetch wrapper) | @FrontendExpert | 🔴 | ⬜ | FE11-001 | 3h |

### 11.2 Design System

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE11-008 | Définir palette de couleurs (style Apple) | @UXDesignExpert | 🔴 | ⬜ | - | 2h |
| FE11-009 | Définir typographie et espacements | @UXDesignExpert | 🔴 | ⬜ | - | 2h |
| FE11-010 | Créer tokens CSS (variables) | @FrontendExpert | 🔴 | ⬜ | FE11-008, FE11-009 | 2h |
| FE11-011 | Composant `Button` (avec texte, pas juste icônes) | @FrontendExpert | 🔴 | ⬜ | FE11-010 | 2h |
| FE11-012 | Composant `Input` | @FrontendExpert | 🔴 | ⬜ | FE11-010 | 2h |
| FE11-013 | Composant `Select` | @FrontendExpert | 🔴 | ⬜ | FE11-010 | 2h |
| FE11-014 | Composant `Card` | @FrontendExpert | 🔴 | ⬜ | FE11-010 | 1h |
| FE11-015 | Composant `Modal` | @FrontendExpert | 🔴 | ⬜ | FE11-010 | 2h |
| FE11-016 | Composant `Table` | @FrontendExpert | 🔴 | ⬜ | FE11-010 | 3h |
| FE11-017 | Composant `Toast/Notification` | @FrontendExpert | 🟠 | ⬜ | FE11-010 | 2h |
| FE11-018 | Composant `Loader/Spinner` | @FrontendExpert | 🟠 | ⬜ | FE11-010 | 1h |
| FE11-019 | Composant `Badge` | @FrontendExpert | 🟠 | ⬜ | FE11-010 | 1h |
| FE11-020 | Composant `Stat Card` (pour KPIs) | @FrontendExpert | 🔴 | ⬜ | FE11-014 | 2h |
| FE11-021 | Documentation Storybook (optionnel) | @FrontendExpert | 🟢 | ⬜ | FE11-011 à FE11-020 | 4h |

---

## Phase 12 : Frontend - Layout et Navigation

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE12-001 | Layout principal (sidebar + header + content) | @FrontendExpert | 🔴 | ⬜ | FE11-010 | 4h |
| FE12-002 | Sidebar navigation | @FrontendExpert | 🔴 | ⬜ | FE12-001 | 3h |
| FE12-003 | Header avec profil et switch business | @FrontendExpert | 🔴 | ⬜ | FE12-001 | 3h |
| FE12-004 | Menu mobile responsive | @FrontendExpert | 🔴 | ⬜ | FE12-002 | 3h |
| FE12-005 | Breadcrumb navigation | @FrontendExpert | 🟡 | ⬜ | FE12-001 | 2h |
| FE12-006 | Affichage conditionnel menu "Rotations" | @FrontendExpert | 🔴 | ⬜ | FE12-002 | 1h |
| FE12-007 | Protection des routes par rôle | @FrontendExpert | 🔴 | ⬜ | FE11-005 | 3h |

---

## Phase 13 : Frontend - Pages Authentification

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE13-001 | Page Login | @FrontendExpert | 🔴 | ⬜ | FE11-007 | 3h |
| FE13-002 | Page Forgot Password | @FrontendExpert | 🟠 | ⬜ | FE11-007 | 2h |
| FE13-003 | Page Reset Password | @FrontendExpert | 🟠 | ⬜ | FE11-007 | 2h |
| FE13-004 | Gestion du token/session | @FrontendExpert | 🔴 | ⬜ | FE11-005 | 2h |
| FE13-005 | Redirection après login | @FrontendExpert | 🔴 | ⬜ | FE13-001 | 1h |

---

## Phase 14 : Frontend - Dashboard

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE14-001 | Page Dashboard principale | @FrontendExpert | 🔴 | ⬜ | FE12-001 | 4h |
| FE14-002 | KPIs cards (CA, entrées, sorties, marge) | @FrontendExpert | 🔴 | ⬜ | FE11-020, D9-003 | 3h |
| FE14-003 | Graphique ventes (Chart.js/Recharts) | @FrontendExpert | 🔴 | ⬜ | D9-004 | 4h |
| FE14-004 | Graphique entrées vs sorties | @FrontendExpert | 🔴 | ⬜ | D9-005 | 3h |
| FE14-005 | Liste top clients | @FrontendExpert | 🟠 | ⬜ | D9-006 | 2h |
| FE14-006 | Liste top produits | @FrontendExpert | 🟠 | ⬜ | D9-007 | 2h |
| FE14-007 | Widget créances en cours | @FrontendExpert | 🟠 | ⬜ | D9-009 | 2h |
| FE14-008 | Widget performance rotation (conditionnel) | @FrontendExpert | 🟠 | ⬜ | D9-008 | 3h |
| FE14-009 | Sélecteur de période (jour/semaine/mois/année) | @FrontendExpert | 🟠 | ⬜ | FE14-001 | 2h |

---

## Phase 15 : Frontend - Pages Transactions

### 15.1 Entrées d'Argent

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE15-001 | Page liste des entrées | @FrontendExpert | 🔴 | ⬜ | T5-003 | 3h |
| FE15-002 | Modal/Page création entrée | @FrontendExpert | 🔴 | ⬜ | T5-004 | 3h |
| FE15-003 | Modal/Page édition entrée | @FrontendExpert | 🟠 | ⬜ | T5-006 | 2h |
| FE15-004 | Filtres et recherche | @FrontendExpert | 🟠 | ⬜ | T5-008 | 2h |
| FE15-005 | Confirmation suppression | @FrontendExpert | 🟠 | ⬜ | T5-007 | 1h |

### 15.2 Sorties d'Argent

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE15-006 | Page liste des sorties | @FrontendExpert | 🔴 | ⬜ | T5-011 | 3h |
| FE15-007 | Modal/Page création sortie | @FrontendExpert | 🔴 | ⬜ | T5-012 | 4h |
| FE15-008 | Sélection catégorie de sortie | @FrontendExpert | 🔴 | ⬜ | T5-018 | 2h |
| FE15-009 | Upload pièces justificatives | @FrontendExpert | 🟠 | ⬜ | T5-016 | 3h |
| FE15-010 | Modal/Page édition sortie | @FrontendExpert | 🟠 | ⬜ | T5-014 | 2h |
| FE15-011 | Affichage des pièces jointes | @FrontendExpert | 🟠 | ⬜ | FE15-009 | 2h |

---

## Phase 16 : Frontend - Pages Stock

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE16-001 | Page liste du stock | @FrontendExpert | 🔴 | ⬜ | S6-003 | 3h |
| FE16-002 | Modal/Page création article | @FrontendExpert | 🔴 | ⬜ | S6-004 | 3h |
| FE16-003 | Modal/Page édition article | @FrontendExpert | 🟠 | ⬜ | S6-006 | 2h |
| FE16-004 | Page détail article avec historique | @FrontendExpert | 🟠 | ⬜ | S6-008 | 3h |
| FE16-005 | Modal mouvement de stock (entrée) | @FrontendExpert | 🔴 | ⬜ | S6-010 | 2h |
| FE16-006 | Modal mouvement de stock (sortie) | @FrontendExpert | 🔴 | ⬜ | S6-011 | 2h |
| FE16-007 | Indicateur visuel stock bas | @FrontendExpert | 🟡 | ⬜ | S6-014 | 1h |

---

## Phase 17 : Frontend - Pages Ventes

### 17.1 Clients

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE17-001 | Page liste des clients | @FrontendExpert | 🔴 | ⬜ | V7-002 | 3h |
| FE17-002 | Modal création rapide client | @FrontendExpert | 🔴 | ⬜ | V7-003 | 2h |
| FE17-003 | Page profil client | @FrontendExpert | 🔴 | ⬜ | V7-004 | 4h |
| FE17-004 | Historique achats client | @FrontendExpert | 🟠 | ⬜ | V7-007 | 2h |
| FE17-005 | Graphique mouvements client | @FrontendExpert | 🟡 | ⬜ | V7-009 | 3h |
| FE17-006 | Affichage balance/crédit client | @FrontendExpert | 🔴 | ⬜ | V7-008 | 2h |

### 17.2 Fournisseurs

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE17-007 | Page liste des fournisseurs | @FrontendExpert | 🔴 | ⬜ | V7-011 | 3h |
| FE17-008 | Modal/Page création fournisseur | @FrontendExpert | 🔴 | ⬜ | V7-012 | 2h |
| FE17-009 | Page détail fournisseur | @FrontendExpert | 🟠 | ⬜ | V7-013 | 3h |

### 17.3 Ventes

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE17-010 | Page liste des ventes | @FrontendExpert | 🔴 | ⬜ | V7-019 | 3h |
| FE17-011 | Page/Modal nouvelle vente | @FrontendExpert | 🔴 | ⬜ | V7-020, V7-021 | 6h |
| FE17-012 | Sélection articles avec quantité | @FrontendExpert | 🔴 | ⬜ | FE17-011 | 3h |
| FE17-013 | Sélection/création client | @FrontendExpert | 🔴 | ⬜ | FE17-011, FE17-002 | 2h |
| FE17-014 | Choix type vente (cash/crédit) | @FrontendExpert | 🔴 | ⬜ | FE17-011 | 2h |
| FE17-015 | Liaison rotation (si applicable) | @FrontendExpert | 🟠 | ⬜ | FE17-011 | 2h |
| FE17-016 | Page détail vente | @FrontendExpert | 🔴 | ⬜ | V7-022 | 3h |
| FE17-017 | Modal enregistrement paiement | @FrontendExpert | 🔴 | ⬜ | V7-025 | 3h |
| FE17-018 | Historique paiements | @FrontendExpert | 🟠 | ⬜ | V7-026 | 2h |
| FE17-019 | Filtres ventes (date, client, statut) | @FrontendExpert | 🟠 | ⬜ | V7-028 | 2h |

---

## Phase 18 : Frontend - Pages Rotations

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE18-001 | Page liste des rotations | @FrontendExpert | 🔴 | ⬜ | R8-004 | 3h |
| FE18-002 | Modal/Page création rotation | @FrontendExpert | 🔴 | ⬜ | R8-005 | 3h |
| FE18-003 | Page détail rotation | @FrontendExpert | 🔴 | ⬜ | R8-006 | 4h |
| FE18-004 | Liste dépenses de la rotation | @FrontendExpert | 🟠 | ⬜ | R8-009 | 2h |
| FE18-005 | Liste ventes de la rotation | @FrontendExpert | 🟠 | ⬜ | R8-010 | 2h |
| FE18-006 | Résumé financier rotation | @FrontendExpert | 🔴 | ⬜ | R8-011, R8-012 | 3h |
| FE18-007 | Page clôture rotation | @FrontendExpert | 🔴 | ⬜ | R8-013, R8-014 | 4h |
| FE18-008 | Checklist de validation | @FrontendExpert | 🔴 | ⬜ | R8-015 | 3h |
| FE18-009 | Indicateur visuel rotation clôturée | @FrontendExpert | 🟠 | ⬜ | R8-016 | 1h |

---

## Phase 19 : Frontend - Pages Administration

### 19.1 Gestion Utilisateurs

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE19-001 | Page liste utilisateurs | @FrontendExpert | 🔴 | ⬜ | O4-014 | 3h |
| FE19-002 | Modal/Page création utilisateur | @FrontendExpert | 🔴 | ⬜ | O4-015 | 4h |
| FE19-003 | Génération mot de passe | @FrontendExpert | 🟠 | ⬜ | A3-008 | 1h |
| FE19-004 | Assignation business et rôle | @FrontendExpert | 🔴 | ⬜ | O4-020 | 3h |
| FE19-005 | Page profil utilisateur | @FrontendExpert | 🟠 | ⬜ | O4-016 | 3h |
| FE19-006 | Modal réinitialisation mot de passe | @FrontendExpert | 🟠 | ⬜ | O4-019 | 2h |

### 19.2 Gestion Business

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE19-007 | Page liste des business | @FrontendExpert | 🔴 | ⬜ | O4-006 | 3h |
| FE19-008 | Modal/Page création business | @FrontendExpert | 🔴 | ⬜ | O4-007 | 3h |
| FE19-009 | Choix type business (standard/rotation) | @FrontendExpert | 🔴 | ⬜ | O4-012 | 2h |
| FE19-010 | Page paramètres business | @FrontendExpert | 🟠 | ⬜ | O4-009 | 3h |
| FE19-011 | Sélecteur de business (switch) | @FrontendExpert | 🔴 | ⬜ | O4-011 | 3h |

### 19.3 Profil Personnel

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| FE19-012 | Page mon profil | @FrontendExpert | 🟠 | ⬜ | A3-006 | 3h |
| FE19-013 | Formulaire édition profil | @FrontendExpert | 🟠 | ⬜ | A3-007 | 3h |
| FE19-014 | Upload photo de profil | @FrontendExpert | 🟡 | ⬜ | F1-015 | 2h |
| FE19-015 | Changement mot de passe | @FrontendExpert | 🟠 | ⬜ | A3-007 | 2h |

---

## Phase 20 : Tests

### 20.1 Tests Backend

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| T20-001 | Configuration Jest/Japa | @QAEngineer | 🔴 | ⬜ | F1-002 | 2h |
| T20-002 | Tests unitaires services auth | @QAEngineer | 🔴 | ⬜ | A3-001 | 4h |
| T20-003 | Tests unitaires service permissions | @QAEngineer | 🔴 | ⬜ | A3-018 | 4h |
| T20-004 | Tests unitaires service transactions | @QAEngineer | 🟠 | ⬜ | T5-002, T5-010 | 4h |
| T20-005 | Tests unitaires service stock | @QAEngineer | 🟠 | ⬜ | S6-002 | 3h |
| T20-006 | Tests unitaires service ventes | @QAEngineer | 🔴 | ⬜ | V7-018 | 5h |
| T20-007 | Tests unitaires service rotations | @QAEngineer | 🟠 | ⬜ | R8-003 | 4h |
| T20-008 | Tests intégration API auth | @QAEngineer | 🔴 | ⬜ | A3-002 à A3-009 | 4h |
| T20-009 | Tests intégration API transactions | @QAEngineer | 🟠 | ⬜ | Phase 5 | 4h |
| T20-010 | Tests intégration API ventes | @QAEngineer | 🔴 | ⬜ | Phase 7 | 5h |
| T20-011 | Tests sécurité isolation données | @QAEngineer | 🔴 | ⬜ | A3-020 à A3-022 | 6h |
| T20-012 | Tests de performance API | @QAEngineer | 🟡 | ⬜ | Phases 4-9 | 4h |

### 20.2 Tests Frontend

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| T20-013 | Configuration Vitest | @QAEngineer | 🟠 | ⬜ | FE11-001 | 2h |
| T20-014 | Tests composants design system | @QAEngineer | 🟡 | ⬜ | Phase 11 | 4h |
| T20-015 | Tests pages auth | @QAEngineer | 🟠 | ⬜ | Phase 13 | 3h |
| T20-016 | Tests E2E parcours vente | @QAEngineer | 🟠 | ⬜ | Phase 17 | 4h |
| T20-017 | Tests E2E parcours rotation | @QAEngineer | 🟡 | ⬜ | Phase 18 | 4h |
| T20-018 | Tests responsive mobile | @QAEngineer | 🟠 | ⬜ | Phases 11-19 | 4h |

---

## Phase 21 : DevOps et Déploiement

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| D21-001 | Dockerfile backend production | @DevOpsExpert | 🔴 | ⬜ | Phases 1-10 | 3h |
| D21-002 | Dockerfile frontend production | @DevOpsExpert | 🔴 | ⬜ | Phases 11-19 | 2h |
| D21-003 | docker-compose production | @DevOpsExpert | 🔴 | ⬜ | D21-001, D21-002 | 2h |
| D21-004 | Pipeline CI (tests automatiques) | @DevOpsExpert | 🔴 | ⬜ | Phase 20 | 4h |
| D21-005 | Pipeline CD (déploiement auto) | @DevOpsExpert | 🟠 | ⬜ | D21-004 | 4h |
| D21-006 | Configuration environnement staging | @DevOpsExpert | 🟠 | ⬜ | D21-003 | 3h |
| D21-007 | Configuration environnement production | @DevOpsExpert | 🔴 | ⬜ | D21-006 | 4h |
| D21-008 | Configuration SSL/HTTPS | @DevOpsExpert | 🔴 | ⬜ | D21-007 | 2h |
| D21-009 | Configuration backups BDD automatiques | @DevOpsExpert | 🔴 | ⬜ | D21-007 | 3h |
| D21-010 | Monitoring et alertes | @DevOpsExpert | 🟠 | ⬜ | D21-007 | 4h |
| D21-011 | Documentation déploiement | @DevOpsExpert | 🟡 | ⬜ | D21-007 | 3h |

---

## Phase 22 : Documentation

| ID | Tâche | Agent | Priorité | Statut | Dépendances | Estimation |
|----|-------|-------|----------|--------|-------------|------------|
| DOC22-001 | Documentation API (Swagger/OpenAPI) | @BackendExpert | 🟠 | ⬜ | Phases 4-10 | 6h |
| DOC22-002 | Guide d'installation développeur | @LeadArchitect | 🟠 | ⬜ | Phase 1 | 3h |
| DOC22-003 | Guide utilisateur super admin | @UXDesignExpert | 🟡 | ⬜ | Phases 11-19 | 4h |
| DOC22-004 | Guide utilisateur admin business | @UXDesignExpert | 🟡 | ⬜ | Phases 11-19 | 3h |
| DOC22-005 | Guide utilisateur vendeur | @UXDesignExpert | 🟡 | ⬜ | Phases 11-19 | 2h |
| DOC22-006 | FAQ et dépannage | @UXDesignExpert | 🟢 | ⬜ | DOC22-003 à DOC22-005 | 2h |

---

## 📈 Résumé par Phase

| Phase | Nombre de tâches | Estimation totale |
|-------|------------------|-------------------|
| Phase 1 : Fondations | 18 | ~24h |
| Phase 2 : Modèles | 43 | ~62h |
| Phase 3 : Auth & Sécurité | 23 | ~55h |
| Phase 4 : API Organisations | 21 | ~38h |
| Phase 5 : API Transactions | 23 | ~43h |
| Phase 6 : API Stock | 14 | ~32h |
| Phase 7 : API Ventes | 28 | ~52h |
| Phase 8 : API Rotations | 17 | ~40h |
| Phase 9 : API Analytics | 20 | ~48h |
| Phase 10 : API Notifications | 8 | ~16h |
| Phase 11 : Frontend Config | 21 | ~38h |
| Phase 12 : Frontend Layout | 7 | ~19h |
| Phase 13 : Frontend Auth | 5 | ~10h |
| Phase 14 : Frontend Dashboard | 9 | ~28h |
| Phase 15 : Frontend Transactions | 11 | ~27h |
| Phase 16 : Frontend Stock | 7 | ~18h |
| Phase 17 : Frontend Ventes | 19 | ~50h |
| Phase 18 : Frontend Rotations | 9 | ~25h |
| Phase 19 : Frontend Admin | 15 | ~40h |
| Phase 20 : Tests | 18 | ~66h |
| Phase 21 : DevOps | 11 | ~34h |
| Phase 22 : Documentation | 6 | ~20h |
| **TOTAL** | **~353 tâches** | **~785h** |

---

## 🎯 MVP Suggéré (Version 1.0)

Pour un lancement rapide, prioriser :

1. ✅ Phases 1-3 (Fondations, Modèles, Auth)
2. ✅ Phase 4 (Organisations/Business basique)
3. ✅ Phase 5 (Transactions)
4. ✅ Phase 6 (Stock)
5. ✅ Phase 7 (Ventes - cash et crédit)
6. ✅ Phases 11-17 (Frontend essentiel)
7. ✅ Tests critiques (sécurité, ventes)
8. ✅ Déploiement basique

**Rotations (Phase 8, 18)** peuvent être ajoutées en v1.1
