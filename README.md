# EstateHub

**EstateHub** is a real-estate property discovery and analytics web application built as part of the **Ivy Homes Software Engineering Internship Assignment — September 2026**.

The application provides authenticated property browsing, filtering, listing details, saved listings, rentals, projects, and an insights/audit dashboard built on top of the Ivy Homes Property API.

A major part of the assignment was to **not blindly trust the provided API documentation**. The documentation explicitly states that it was generated from old information and was not validated against the running service. Therefore, the running API was treated as the source of truth throughout development.

---

## Features

### Authentication

* Real login using the Ivy Homes authentication API.
* Authenticated API requests using the returned bearer token.
* API key supplied through the required `X-API-Key` header.
* Protected application routes.
* Logout support.

### Property Listings

* Browse property listings from the Ivy Homes API.
* Paginated listing retrieval.
* Property cards containing relevant property information.
* Listing information includes:

  * Price
  * BHK / bedrooms
  * Bathrooms
  * Carpet area
  * Locality
  * Furnishing
  * Property type
  * Floor information
  * Verification status

### Property Filters

Listings can be filtered using:

* Locality
* Number of bedrooms / BHK
* Minimum price
* Maximum price
* Furnishing

The filters are designed to operate on the actual data returned by the API rather than assuming that the API documentation is always correct.

### Listing Details

Each listing has a dedicated URL:

```text
/listings/:id
```

This allows individual properties to be opened and shared directly through their URL.

### Saved Listings / Favourites

Authenticated users can:

* Save a listing
* Remove a saved listing
* View their saved listings

Saved listings are associated with the authenticated user through the backend API rather than being treated as a global client-side list.

### Rentals

The Rentals section provides a separate view for rental properties.

Displayed information includes:

* Monthly rent
* Security deposit
* BHK
* Bathrooms
* Carpet area
* Locality
* Furnishing
* Property information

### Projects

The Projects section provides information about builder projects, including:

* Project name
* Developer
* Locality
* Project status
* Total units
* Total towers
* Total floors
* Area range
* Price range
* RERA number
* Available listing count

### Insights & Audit

The Insights section presents information derived from the API dataset and highlights important observations from the API investigation.

The audit focuses on areas such as:

* Authentication
* Pagination
* Units
* Filters
* Sorting
* Timestamps
* Duplicate records
* Data completeness
* Data quality
* Fraudulent/fake listings
* Cross-endpoint consistency
* Missing endpoints
* Undocumented endpoints

---

# Technology Stack

### Frontend

* React
* JavaScript
* Vite
* React Router
* Axios
* Lucide React

### API

Ivy Homes Property API:

```text
https://solve.ivy.homes
```

### Development

* VS Code
* Git
* GitHub
* Browser Developer Tools
* Google Gemini

---

# Project Structure

```text
EstateHub/
│
├── public/
│
├── src/
│   │
│   ├── api/
│   │   └── client.js
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Filters.jsx
│   │   ├── ListingCard.jsx
│   │   └── Navbar.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── FavouritesContext.jsx
│   │
│   ├── pages/
│   │   ├── Analytics.jsx
│   │   ├── Insights.jsx
│   │   ├── ListingDetail.jsx
│   │   ├── Listings.jsx
│   │   ├── Login.jsx
│   │   ├── Projects.jsx
│   │   ├── Rentals.jsx
│   │   └── Saved.jsx
│   │
│   ├── utils/
│   │   └── formatters.js
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package.json
└── package-lock.json
```

---

# Application Architecture

The application is divided into several logical layers.

### API Layer

`src/api/client.js`

Responsible for communication with the Ivy Homes API.

This keeps API communication separate from the UI components and pages.

### Components

`src/components/`

Contains reusable UI components such as:

* `Filters`
* `ListingCard`
* `Navbar`

### Context

`src/context/`

Contains application-wide state related to:

* Authentication
* Favourite/saved listings

### Pages

`src/pages/`

Contains the major screens of the application:

* Listings
* Listing Details
* Rentals
* Projects
* Saved Listings
* Insights
* Analytics
* Login

### Utilities

`src/utils/`

Contains helper functions for formatting and normalizing property-related values.

---

# Running the Project Locally

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git

---

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd EstateHub
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env` file in the root directory.

```env
VITE_API_BASE_URL=https://solve.ivy.homes
VITE_API_KEY=<YOUR_IVY_HOMES_API_KEY>
```

The API key should **not** be committed to GitHub.

The `.env` file is included in `.gitignore`.

---

## 4. Start the development server

```bash
npm run dev
```

Vite will provide a local development URL, usually:

```text
http://localhost:5173
```

Open the URL in a browser.

---

## 5. Production build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

# API Investigation

One of the central requirements of this assignment was identifying discrepancies between the supplied API documentation and the running API.

The supplied API reference explicitly warns that:

> The running API is the only source of truth.

Therefore, I did not assume that documented endpoints, parameters, response formats, units, or authentication behavior were correct.

The investigation followed a simple principle:

```text
Documentation
      ↓
Form a hypothesis
      ↓
Test against running API
      ↓
Compare expected vs actual behavior
      ↓
Reproduce across additional records/endpoints
      ↓
Record only verified discrepancies
```

This was important because the assignment specifically distinguishes between things that are genuinely wrong and things that are correctly documented.

---

# Authentication Investigation

The API documentation states that the API key should be supplied as a query parameter.

However, testing the running API showed that the API requires the API key in the request header:

```http
X-API-Key: <API_KEY>
```

For example, requests without the required API-key header returned an authentication error.

The application therefore sends the API key through the request headers instead of relying on the documented query-parameter behavior.

The user session is separately authenticated using:

```text
POST /auth/login
```

and the returned token is supplied using:

```http
Authorization: Bearer <TOKEN>
```

---

# Pagination Investigation

The supplied documentation describes collection pagination using `page` and `limit`.

During testing, the running listings endpoint was observed to return pagination information using `limit` and `offset`, including fields such as:

```json
{
  "limit": 50,
  "offset": 0,
  "count": 50,
  "total": 4240,
  "has_more": true,
  "results": []
}
```

Therefore, the application follows the pagination behavior exposed by the running API rather than assuming the documented page-based behavior.

For dataset-level analysis, the complete listing dataset is retrieved by continuing through the available offsets until the API indicates that no more records remain.

This is particularly important for the ten assignment questions because the assignment defines "retrievable" as all records obtainable after paging to the end without filters.

---

# How I Decided What to Distrust

I used several categories of hypotheses when comparing the API documentation against the running API.

### 1. Authentication

I checked:

* API-key location
* Required headers
* Login response
* Token behavior
* Authentication failures

### 2. Pagination

I checked:

* Pagination parameter names
* Returned pagination metadata
* Page size
* Total count
* Whether `has_more` correctly indicates additional data

### 3. Filters

I tested documented filters against actual results to determine whether they genuinely changed the returned dataset.

Examples included:

* Locality
* BHK
* Price range
* Furnishing

A filter was not considered incorrect merely because it produced an unexpected number of results. It was considered a discrepancy only when its actual behavior contradicted what the documentation claimed.

### 4. Units

I compared documented units against actual values in the returned records.

This included checking:

* Property prices
* Rental prices
* Carpet area
* Project prices
* Project area values

### 5. Timestamps

I examined timestamp formats and timezone behavior rather than assuming that every timestamp followed the documented convention.

This was especially important for the seven-day listing calculation because the assignment specifies a fixed reference timestamp in IST.

### 6. Data Quality

I examined records for values that describe physically impossible properties or otherwise inconsistent data.

Examples of checks include:

* Invalid floor numbers
* Invalid area relationships
* Suspicious prices
* Missing required values
* Other internally inconsistent property information

### 7. Duplicate Properties

I did not assume that every listing record represented a different physical property.

Multiple records can potentially describe the same property, so the dataset was analyzed separately for listing-record count and unique-property count.

### 8. Cross-Endpoint Consistency

Where the API exposes related information through different endpoints, I compared the values.

For example, project listing counts can be compared against listings associated with that project.

### 9. Missing or Undocumented Endpoints

Documented endpoints were tested directly rather than assuming that their existence from the reference document meant they were actually deployed.

Similarly, endpoints observed through actual API behavior were treated as potentially undocumented behavior and investigated separately.

---

# What I Checked That Turned Out to Be Fine

An important part of the investigation was distinguishing genuine discrepancies from hypotheses that did **not** produce a discrepancy.

I did not treat every difference in data as an API problem.

The checks that were tested and found to behave consistently with the documentation are documented here:

* Basic authenticated API access after providing the required credentials.
* Listing data could be retrieved successfully from the running service.
* Pagination metadata was observable in the API response and could be used to determine whether additional records remained.
* Listing detail data was retrievable for valid listing identifiers.
* Rental data exposed monthly rent separately from the security deposit.
* Project data exposed separate minimum and maximum price values.
* API error responses provided useful information when requests were invalid.

The distinction between these successful checks and actual discrepancies was important: **only behavior that could be reproduced against the running service was included as an audit finding.**

---

# Data Analysis

The assignment requires ten values to be calculated from the candidate's own city-specific API data.

The calculations are represented in `submission.json`.

The required values are:

1. Total listing records retrievable from `/v1/listings`
2. Number of unique physical properties
3. Number of active listings
4. Corrupt listing IDs
5. Total monthly rent in the assigned locality
6. Average price per square foot for qualifying live 2-BHK listings
7. Costliest project
8. Listings posted during the specified seven-day interval
9. Fake listing IDs
10. Number of projects with incorrect `total_listings`

These values are intentionally calculated from the candidate-specific API dataset because the assignment states that different API keys can correspond to different cities and therefore different correct answers.

---

# Audit Findings

The audit findings are provided in `submission.json` under the `findings` array.

Each finding contains:

```json
{
  "endpoint": "",
  "category": "",
  "documented": "",
  "actual": "",
  "how_found": "",
  "impact": "",
  "evidence": []
}
```

The categories used are those specified by the assignment:

```text
auth
pagination
units
filters
sorting
timestamps
duplicates
completeness
data_quality
fraud
consistency
missing_endpoint
undocumented_endpoint
```

For record-level findings, evidence identifiers such as `listing_id` or `project_id` are included wherever applicable.

I intentionally avoided reporting a discrepancy solely based on assumptions or AI-generated suggestions. Findings were included only after reproduction against the running API.

---

# Security

The Ivy Homes API key is sensitive and is therefore loaded through an environment variable.

Example:

```env
VITE_API_KEY=<YOUR_API_KEY>
```

The actual key should never be committed to source control or included in the README.

The `.gitignore` file excludes environment files such as:

```text
.env
.env.local
.env.*.local
```

The API key supplied for the assignment is scoped to the candidate's assigned city and should not be shared.

---

# AI Usage Disclosure

I used **Google Gemini** as an AI-assisted development tool while building EstateHub.

Gemini was used for assistance with:

* Understanding implementation approaches
* Debugging
* Code development
* Exploring possible solutions
* Reviewing implementation ideas

AI assistance was treated as a development aid rather than as the source of truth for the assignment.

In particular, API behavior and assignment findings were checked against the **running Ivy Homes API**. The supplied API reference itself states that it was generated by an AI assistant from older information and may contain incorrect or outdated information, so I did not rely on AI-generated conclusions without verification.

---

# Design Decisions

## Running API as Source of Truth

The most important design decision was to build against the actual behavior of the API rather than blindly following the reference document.

This affected authentication, pagination, filtering, data interpretation, and audit analysis.

## Separation of API and UI

API communication is kept inside the API client layer, while UI components and pages consume the resulting data.

This makes it easier to modify API behavior without rewriting the entire UI.

## Reusable Components

Common UI functionality is separated into reusable components such as:

* `Navbar`
* `Filters`
* `ListingCard`

This keeps page-level components focused on their respective screens.

## Shared Authentication and Favourite State

React Context is used for application-wide authentication and favourite state.

This avoids passing authentication/favourite information through multiple levels of unrelated components.

---

# Challenges

### 1. Documentation vs Actual API

The largest challenge was that the supplied API documentation could not be treated as authoritative.

The solution was to test assumptions systematically against the running service.

### 2. Large Dataset

Several assignment questions require analyzing all retrievable records rather than a single API page.

Therefore, pagination and complete dataset retrieval were important parts of the implementation.

### 3. Data Quality

Some records require additional validation instead of simply displaying their values.

For example, a property can have a technically valid JSON response while containing values that are inconsistent or physically impossible.

### 4. Record vs Property

A listing record and a physical property are not necessarily the same thing.

The assignment explicitly asks for both the total number of listing records and the number of unique physical properties, requiring separate analysis.

---

# What I Would Improve With Another Two Days

If I had two additional days, I would prioritize improvements in the following order.

## 1. Strengthen Authentication and Session Handling

I would further improve the authentication lifecycle by handling:

* Token expiry
* Automatic session restoration
* Authentication failures
* Token refresh where supported
* Better logout/error handling

The goal would be to make the session behavior more robust across refreshes and longer sessions.

## 2. Improve API/Data Layer

I would introduce a more structured data-access layer with:

* Centralized API error handling
* Request cancellation
* Better loading states
* Caching
* Retry handling where appropriate
* More consistent response normalization

## 3. Improve Listing Experience

I would add:

* Better sorting
* More filter options
* URL-persisted filters
* Debounced filtering
* Improved pagination/infinite scrolling
* Better empty states
* Better error states

## 4. Improve Insights

The Insights screen could become a more complete data-quality dashboard with:

* Price distribution
* Price-per-square-foot analysis
* Locality comparison
* BHK distribution
* Furnishing distribution
* Live vs inactive listing analysis
* Duplicate-property analysis
* Project/listing consistency checks

## 5. Add Automated Tests

I would add automated tests for:

* Authentication
* Filters
* Pagination
* Listing detail routing
* Favourite operations
* Data-quality calculations
* Price/area normalization
* Edge cases

## 6. Improve Accessibility and UX

I would further improve:

* Keyboard navigation
* Semantic HTML
* Screen-reader support
* Loading skeletons
* Error messages
* Responsive layouts
* Visual consistency

---

# API Safety

The assignment explicitly states that the API should not be attacked or abused.

All API interaction in this project is limited to the required application and data-analysis use cases.

No credential stuffing, denial-of-service behavior, scanning for other users' keys, or other abusive activity was performed.

The API's documented rate limit is more than sufficient for the required analysis.

---

# Submission Files

The repository contains the frontend application and the required assignment artifacts.

The expected submission structure is:

```text
EstateHub/
│
├── src/
├── public/
├── README.md
├── submission.json
├── package.json
├── package-lock.json
├── eslint.config.js
└── ...
```

`submission.json` contains:

* Candidate information
* API answers
* API discrepancy findings

The structure follows the submission template provided with the assignment.

---

# Conclusion

EstateHub is a real-estate discovery and analytics application built on top of the Ivy Homes Property API.

Beyond implementing the frontend, the project focuses on validating assumptions against the actual API, analyzing the complete available dataset, identifying reproducible documentation discrepancies, and exposing useful data-quality insights to the user.

The core principle throughout the project was:

> **The running API is the source of truth.**

This approach allowed the application and the final assignment analysis to be based on observed behavior rather than assumptions made from potentially outdated documentation.

---

## Author

**Adarsh**

**Project:** EstateHub
**Assignment:** Ivy Homes Software Engineering Internship — September 2026
