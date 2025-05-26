#!/bin/bash
set -e

# Download the large ephemeris file from Dropbox
# REPLACE THE LINK BELOW with your Dropbox direct download link before deploying!
# Example: https://www.dropbox.com/s/yourfileid/de406e.eph?dl=1
curl -L "https://www.dropbox.com/scl/fi/7b8ty2o2a6a5xisp69r8t/de406e.eph?rlkey=x1vxacu9hj8hewk5nlb1o42gu&st=a3g8mf3b&dl=1" -o de406e.eph

echo "Large file downloaded!"
