<?php
declare(strict_types=1);

/*
 * Vorlage für die private Praxis-Hub-Konfiguration.
 *
 * Diese Datei gehört NICHT in den öffentlichen Webroot. Auf IONOS liegt die
 * echte Datei standardmäßig unter:
 *   /.nextcourse-private/praxis-passes.php
 *
 * Alternativ kann NC_PRAXIS_CONFIG auf einen absoluten, nicht öffentlichen
 * Dateipfad zeigen. Token und Code werden ausschließlich als SHA-256-Hashes
 * gespeichert. Der deaktivierte Beispieleintrag ist kein nutzbarer Zugang.
 */
return [
    'session' => [
        'idle_seconds' => 3600,
        'absolute_seconds' => 43200,
    ],
    'passes' => [
        'beispiel-zugang' => [
            'label' => 'Beispiel',
            'token_hash' => str_repeat('0', 64),
            'code_hash' => str_repeat('0', 64),
            'active' => false,
            'expires_at' => '2026-12-31T23:59:59+01:00',
            'topics' => ['zeit', 'energie', 'prompts', 'skills'],
        ],
    ],
];
