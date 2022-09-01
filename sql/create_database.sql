CREATE TABLE users (
    id NUMERIC NOT NULL,
    name TEXT NOT NULL,
    discriminator TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE user_status (
    user_id NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL,
    PRIMARY KEY (user_id, timestamp)
    FOREIGN KEY (user_id) REFERENCES users(id)
);