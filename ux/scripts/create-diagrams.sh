#!/bin/bash

set -e

DIRECTORY="$(dirname "$0")/.."

for FILE in "$DIRECTORY"/*.d2; do
  # Skip if no .d2 files are found
  if [ ! -e "$FILE" ]; then
    echo "No .d2 files found in '$DIRECTORY'."
    exit 0
  fi

  # Extract the filename without extension
  BASENAME=$(basename "$FILE" .d2)

  # Run the d2 command
  d2 "$FILE" "$DIRECTORY/diagrams/$BASENAME.png"
done

echo "Diagrams created successfully."
