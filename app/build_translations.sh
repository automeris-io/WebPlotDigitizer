#!/bin/bash

pybabel -v extract -F templates/babel.config -o ./locale/messages.pot ./templates
pybabel update -l en_US -d ./locale/ -i ./locale/messages.pot
pybabel update -l fr_FR -d ./locale/ -i ./locale/messages.pot
pybabel update -l zh_CN -d ./locale/ -i ./locale/messages.pot
pybabel update -l de_DE -d ./locale/ -i ./locale/messages.pot
pybabel update -l ja -d ./locale/ -i ./locale/messages.pot
pybabel update -l ru -d ./locale/ -i ./locale/messages.pot

