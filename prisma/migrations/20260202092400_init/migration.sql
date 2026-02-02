-- CreateTable
CREATE TABLE "ad_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "platform" TEXT NOT NULL,
    "external_account_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "connected_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" UUID,
    "platform" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "date_hour" TIMESTAMPTZ(6),
    "summary" TEXT,
    "actions_json" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" SERIAL NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "api_key" TEXT NOT NULL,
    "platform" TEXT DEFAULT 'unknown',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ad_account_id" TEXT,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_stats" (
    "id" SERIAL NOT NULL,
    "campaign_name" TEXT,
    "spend" DECIMAL,
    "revenue" DECIMAL,
    "clicks" INTEGER,
    "conversions" INTEGER,
    "ai_roi_calc" DECIMAL,
    "ai_advice" TEXT,
    "last_analyzed_at" TIMESTAMP(6),

    CONSTRAINT "campaign_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255),
    "campaign_name" VARCHAR(255),
    "platform" VARCHAR(50),
    "status" VARCHAR(50),
    "budget" DECIMAL(10,2),
    "metrics" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics_daily" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" UUID,
    "platform" TEXT,
    "account_id" TEXT,
    "campaign_id" TEXT,
    "adset_id" TEXT,
    "ad_id" TEXT,
    "date" DATE,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "spend" DECIMAL,
    "ctr" DECIMAL,
    "cpc" DECIMAL,
    "cpm" DECIMAL,
    "conversions" INTEGER,
    "revenue" DECIMAL,
    "geo" TEXT,
    "device" TEXT,
    "os" TEXT,
    "placement" TEXT,
    "objective" TEXT,
    "bid_strategy" TEXT,
    "ad_format" TEXT,
    "creative_len_sec" INTEGER,
    "ai_roi_calc" DECIMAL,
    "ai_advice" TEXT,

    CONSTRAINT "metrics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_reports" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255),
    "report_name" VARCHAR(255),
    "insights" TEXT[],
    "recommendations" TEXT[],
    "confidence_score" DECIMAL(3,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_actions" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" UUID,
    "platform" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "action" TEXT,
    "params_json" JSONB,
    "reason" TEXT,
    "prediction_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "error_text" TEXT,

    CONSTRAINT "policy_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" UUID,
    "platform" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "date_hour" TIMESTAMPTZ(6),
    "prob_profit" DECIMAL,
    "pred_roi" DECIMAL,
    "model_version" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_settings" (
    "id" SERIAL NOT NULL,
    "project_name" TEXT NOT NULL,
    "vertical" TEXT NOT NULL,
    "geo" TEXT NOT NULL,
    "target_cpa" DECIMAL(10,2),
    "min_conversion_rate" DECIMAL(5,2),
    "ad_account_id" TEXT,
    "telegram_chat_id" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cache" (
    "tenant_id" UUID NOT NULL,
    "report_type" TEXT NOT NULL,
    "param_hash" TEXT NOT NULL,
    "ttl_until" TIMESTAMPTZ(6),
    "payload" JSONB,

    CONSTRAINT "report_cache_pkey" PRIMARY KEY ("tenant_id","report_type","param_hash")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255),
    "traffic_source" VARCHAR(50),
    "traffic_source_api_key" TEXT,
    "vertical" VARCHAR(50),
    "geo" VARCHAR(10),
    "affiliate_network" VARCHAR(50),
    "affiliate_api_key" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_users" (
    "id" SERIAL NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "username" TEXT,
    "fb_token" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_quotas" (
    "tenant_id" UUID NOT NULL,
    "plan" TEXT,
    "llm_tokens_day" INTEGER,
    "llm_tokens_total" INTEGER,
    "predictions_day" INTEGER,
    "cooldown_minutes" INTEGER,
    "vertex_batch_every_min" INTEGER,
    "valid_until" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_quotas_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'trial',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_ledger" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" UUID,
    "kind" TEXT,
    "amount" INTEGER,
    "ts" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "clerk_id" VARCHAR(255),
    "is_onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_campaigns_user_id" ON "campaigns"("user_id");

-- CreateIndex
CREATE INDEX "idx_md_tenant_date" ON "metrics_daily"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "idx_md_tenant_platform_account_date" ON "metrics_daily"("tenant_id", "platform", "account_id", "date");

-- CreateIndex
CREATE INDEX "idx_preds_tenant_time" ON "predictions"("tenant_id", "date_hour");

-- CreateIndex
CREATE INDEX "idx_settings_user_id" ON "settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_chat_id_key" ON "telegram_users"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_clerk_id" ON "users"("clerk_id");

-- AddForeignKey
ALTER TABLE "ad_accounts" ADD CONSTRAINT "ad_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "metrics_daily" ADD CONSTRAINT "metrics_daily_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ml_reports" ADD CONSTRAINT "ml_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "policy_actions" ADD CONSTRAINT "policy_actions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tenant_quotas" ADD CONSTRAINT "tenant_quotas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
