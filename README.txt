Open Ethnographer

Installation instructions are at https://edgeryders.eu/en/open-ethnographer/open-ethnographer-manual

# Updating from upstream

git subtree pull --prefix drupal_annotation git://git.drupal.org/project/annotation.git 7.x-1.x
git subtree pull --prefix drupal_annotator git://git.drupal.org/project/annotator.git 7.x-1.x
git subtree pull --prefix annotatorjs https://github.com/openannotation/annotator.git master


# Enabling the modules in Drupal

from Drupal root:

cd sites/all/modules
ln -s [repo_path]/drupal_annotator annotator
ln -s [repo_path]/drupal_annotation annotation
drush pm-enable annotator
drush pm-enable annotation
