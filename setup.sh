# Run the following once from a machine with `gcloud` authenticated:

  PROJECT_ID="hops-dev-488516"
  PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
  GITHUB_REPO="djwalker/hops-prototype-figma"   # e.g. djwalker/waste-logger-mvp
  SA="waste-logger-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

  # 1. Enable required APIs
  gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    iam.googleapis.com \
    iamcredentials.googleapis.com

  # 2. Create Artifact Registry repository
  gcloud artifacts repositories create waste-logger \
    --repository-format=docker --location=us-south1

  # 3. Create deployer service account
  gcloud iam service-accounts create waste-logger-deployer \
    --display-name="Waste Logger GitHub Actions Deployer" \
    --project=$PROJECT_ID

  # 4. Grant IAM roles to the service account
  for ROLE in roles/run.admin roles/artifactregistry.writer \
              roles/iam.serviceAccountUser roles/storage.admin; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:${SA}" --role=$ROLE
  done

  # 5. Create Workload Identity Pool
  gcloud iam workload-identity-pools create github-pool \
    --location=global \
    --display-name="GitHub Actions Pool" \
    --project=$PROJECT_ID

  # 6. Create OIDC Provider (scoped to this repo only)
  gcloud iam workload-identity-pools providers create-oidc github-provider \
    --location=global \
    --workload-identity-pool=github-pool \
    --display-name="GitHub Actions Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor,attribute.aud=assertion.aud" \
    --attribute-condition="assertion.repository=='${GITHUB_REPO}'" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --project=$PROJECT_ID

  # 7. Allow the GitHub Actions identity to impersonate the service account
  POOL_RESOURCE="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool"
  gcloud iam service-accounts add-iam-policy-binding $SA \
    --role=roles/iam.workloadIdentityUser \
    --member="principalSet://iam.googleapis.com/${POOL_RESOURCE}/attribute.repository/${GITHUB_REPO}"

# ── GitHub Secrets Required ───────────────────────────────────────────────────

#   DATABASE_URL  — Supabase PostgreSQL connection string
#                   e.g. postgresql://postgres.[ref]:[password]@[host]:5432/postgres

# ─────────────────────────────────────────────────────────────────────────────