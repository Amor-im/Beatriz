-- Esquema inicial do Agenda Fácil.
-- Cada mudança no banco vira um arquivo novo (V2__..., V3__...): o Flyway roda na ordem e nunca repete.

-- btree_gist permite misturar "igual" (negocio_id) com "sobrepõe" (faixa de tempo) na mesma regra.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE dono (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(80)  NOT NULL,
    email       VARCHAR(120) NOT NULL,
    senha_hash  VARCHAR(100) NOT NULL,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX dono_email_unico ON dono (lower(email));

CREATE TABLE negocio (
    id          BIGSERIAL PRIMARY KEY,
    dono_id     BIGINT       NOT NULL UNIQUE REFERENCES dono (id) ON DELETE CASCADE,
    nome        VARCHAR(80)  NOT NULL,
    slug        VARCHAR(40)  NOT NULL UNIQUE,
    whatsapp    VARCHAR(11)  NOT NULL,
    endereco    VARCHAR(160),
    fuso        VARCHAR(40)  NOT NULL DEFAULT 'America/Sao_Paulo',
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT negocio_slug_formato CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE servico (
    id               BIGSERIAL PRIMARY KEY,
    negocio_id       BIGINT      NOT NULL REFERENCES negocio (id) ON DELETE CASCADE,
    nome             VARCHAR(60) NOT NULL,
    duracao_minutos  INT         NOT NULL,
    preco_centavos   INT,
    ativo            BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT servico_duracao CHECK (duracao_minutos BETWEEN 5 AND 480 AND duracao_minutos % 5 = 0),
    CONSTRAINT servico_preco CHECK (preco_centavos IS NULL OR preco_centavos >= 0)
);
CREATE INDEX servico_negocio ON servico (negocio_id);

-- Um registro por dia da semana em que o negócio abre (1 = segunda ... 7 = domingo).
-- Dia sem registro = fechado.
CREATE TABLE horario_funcionamento (
    id             BIGSERIAL PRIMARY KEY,
    negocio_id     BIGINT   NOT NULL REFERENCES negocio (id) ON DELETE CASCADE,
    dia_semana     SMALLINT NOT NULL,
    abre           TIME     NOT NULL,
    fecha          TIME     NOT NULL,
    almoco_inicio  TIME,
    almoco_fim     TIME,
    CONSTRAINT horario_dia_unico UNIQUE (negocio_id, dia_semana),
    CONSTRAINT horario_dia_valido CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT horario_ordem CHECK (fecha > abre),
    CONSTRAINT horario_almoco CHECK (
        (almoco_inicio IS NULL AND almoco_fim IS NULL)
        OR (almoco_inicio >= abre AND almoco_fim <= fecha AND almoco_fim > almoco_inicio)
    )
);

-- Folga, feriado ou compromisso: um intervalo em que ninguém pode marcar.
CREATE TABLE bloqueio (
    id          BIGSERIAL PRIMARY KEY,
    negocio_id  BIGINT      NOT NULL REFERENCES negocio (id) ON DELETE CASCADE,
    inicio      TIMESTAMPTZ NOT NULL,
    fim         TIMESTAMPTZ NOT NULL,
    motivo      VARCHAR(80),
    CONSTRAINT bloqueio_ordem CHECK (fim > inicio)
);
CREATE INDEX bloqueio_negocio_inicio ON bloqueio (negocio_id, inicio);

CREATE TABLE agendamento (
    id                BIGSERIAL PRIMARY KEY,
    negocio_id        BIGINT      NOT NULL REFERENCES negocio (id) ON DELETE CASCADE,
    servico_id        BIGINT      NOT NULL REFERENCES servico (id),
    codigo            UUID        NOT NULL UNIQUE,
    cliente_nome      VARCHAR(80) NOT NULL,
    cliente_whatsapp  VARCHAR(11) NOT NULL,
    inicio            TIMESTAMPTZ NOT NULL,
    fim               TIMESTAMPTZ NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'A_CONFIRMAR',
    criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT agendamento_ordem CHECK (fim > inicio),
    CONSTRAINT agendamento_status CHECK (status IN ('A_CONFIRMAR', 'CONFIRMADO', 'CANCELADO')),
    -- A regra mais importante do produto, garantida pelo próprio banco:
    -- dois agendamentos do mesmo negócio não podem ter horários que se sobrepõem
    -- (cancelados não contam). Mesmo que duas pessoas confirmem no mesmo segundo,
    -- só a primeira gravação passa.
    CONSTRAINT agendamento_sem_sobreposicao EXCLUDE USING gist (
        negocio_id WITH =,
        tstzrange(inicio, fim, '[)') WITH &&
    ) WHERE (status <> 'CANCELADO')
);
CREATE INDEX agendamento_negocio_inicio ON agendamento (negocio_id, inicio);
