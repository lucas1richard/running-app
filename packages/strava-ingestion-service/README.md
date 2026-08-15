# Strava Ingestion Service

This service handles the ingestion of activity data from the Strava API into the application's data stores (MySQL and CouchDB). It uses a multi-stage asynchronous pipeline coordinated via gRPC and RabbitMQ to handle rate limits and heavy data processing.

## Activity Ingestion Pipeline

The ingestion process for each activity follows these steps:

### 1. Initial Discovery
The process begins when `fetchNewActivities` is triggered (via gRPC or RabbitMQ).
- **Rate Limiting**: Consumes a token from Redis to adhere to Strava API limits.
- **Strava Fetch**: Retrieves a list of activities from `/athlete/activities`.
- **Basic Storage**: 
    - Bulk-adds activity summaries to **CouchDB**.
    - Bulk-adds activity summaries to **MySQL**.
- **External Triggers**:
    - Triggers a weather fetch via the `activities-service`.
    - Publishes a message to the `imageService` to generate activity maps.
- **Queueing**: Dispatches `details` and `streams` messages to the `stravaIngestionService` queue for every new activity ID.

### 2. Detail Ingestion
Triggered by the `details` message.
- **Strava Fetch**: Fetches full activity details from `/activities/{id}`.
- **Storage**: Saves the detailed activity object into **CouchDB**.

### 3. Stream Ingestion & Processing
Triggered by the `streams` message.
- **Strava Fetch**: Fetches data streams (time, distance, latlng, altitude, heartrate, etc.) from `/activities/{id}/streams`.
- **Raw Storage**: Saves raw streams into **CouchDB**.
- **Route Compression**: Compresses the `latlng` stream and stores the simplified route in **MySQL**.
- **Heart Rate Zone Calculation**:
    - Fetches user heart rate zones for the activity date from MySQL.
    - Aggregates time spent in each zone (Z1-Z5) based on the heart rate stream.
    - Caches these totals in **MySQL**.

### 4. Best Effort Calculation
Executed immediately after stream ingestion.
- **Filtering**: Ensures best efforts aren't recalculated for the same activity.
- **Calculation**: Analyzes the activity to determine performance metrics.
- **Ranking**: Compares results against historical data to assign a `pr_rank` (top 10).
- **Storage**: Inserts ranked best efforts into **MySQL**.

### 5. Lap Ingestion
Triggered by a `laps` message.
- **Strava Fetch**: Fetches lap data from `/activities/{id}/laps`.
- **Storage**: Updates the activity record in **CouchDB** with lap data and marks `has_detailed_laps: true`.

## Tech Stack
- **Runtime**: Node.js
- **API**: gRPC, Strava REST API
- **Messaging**: RabbitMQ
- **Databases**: MySQL, CouchDB, Redis (Rate Limiting)
