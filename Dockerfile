# syntax=docker/dockerfile:1.6
# Image de base avec TeXLive complet
ARG TEXLIVE_TAG=latest-full
FROM texlive/texlive:${TEXLIVE_TAG}

# Installer des packages supplémentaires si nécessaire
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    set -eux; \
    pkgs="python3 python3-pip make inotify-tools"; \
    need_install=""; \
    for p in $pkgs; do dpkg -s "$p" >/dev/null 2>&1 || need_install="$need_install $p"; done; \
    if [ -n "$need_install" ]; then \
      apt-get update; \
      apt-get install -y --no-install-recommends $need_install; \
    fi; \
    rm -rf /var/lib/apt/lists/*

  # Créer un utilisateur non-root pour la sécurité
  RUN set -eux; \
     if id -u latex >/dev/null 2>&1; then \
       echo "User latex already exists"; \
     else \
       uid=1000; \
       while getent passwd "$uid" >/dev/null 2>&1; do uid=$((uid+1)); done; \
       useradd -m -U -u "$uid" latex; \
     fi
  USER latex
  
  # Définir le répertoire de travail
  WORKDIR /workspace

# Copier les fichiers du projet
COPY --chown=latex:latex . .

# Scripts utilitaires
COPY --chown=latex:latex compile.sh /usr/local/bin/compile.sh
COPY --chown=latex:latex watch.sh /usr/local/bin/watch.sh
USER root
RUN chmod +x /usr/local/bin/compile.sh /usr/local/bin/watch.sh
USER latex

# Commande par défaut
CMD ["/usr/local/bin/compile.sh"]
