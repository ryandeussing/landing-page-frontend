import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Card, CardBody, Text, Title } from '@patternfly/react-core';

import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useDispatch } from 'react-redux';

import { removeEstateTile } from '../../store/actions';
import useRequest from './use-request';
import sanitizeHref from '../../utils/sanitize-href';

const FirstPanelTile = ({ id, ...tile }) => {
  const isBeta = useChrome((state) => state?.isBeta());
  if (typeof tile.count === 'undefined' && typeof tile.url === 'undefined') {
    console.error(
      `Estate tile with id "${id}" does not contain "count" or "url" property! Tile will not be rendered.`
    );
    return null;
  }
  const dispatch = useDispatch();
  // No count = no data, remove it from redux store and load next in line
  const onResponse = ({ count, show }) =>
    (typeof count !== 'number' || show === false) &&
    dispatch(removeEstateTile(id));
  // If tile fails to load, remove it from redux store and load next in line
  const onError = () => dispatch(removeEstateTile(id));

  const [{ loaded, title, count, href }] = useRequest(
    tile,
    onResponse,
    onError
  );

  return (
    <div
      className={classnames('estate-group', {
        'is-section': tile?.shape?.section?.length > 0,
      })}
    >
      <div
        className={classnames('estate-section', {
          'is-empty': tile?.shape?.section?.length === 0,
        })}
      >
        <Title headingLevel="h6" size="lg" title={tile?.shape?.section}>
          {tile?.shape?.section}
        </Title>
      </div>
      <a className="estate-content" href={sanitizeHref(href, isBeta) || '#'}>
        <Card isCompact isHoverable isFlat>
          <CardBody>
            <Title
              headingLevel="h5"
              size="3xl"
              className="pf-u-font-weight-light"
            >
              {loaded ? (
                <>{count}</>
              ) : (
                <Skeleton
                  size={SkeletonSize.md}
                  isDark
                  className="pf-u-mb-sm"
                />
              )}
            </Title>
            {loaded ? (
              <Text title={title} component="p" className="pf-u-text-truncate">
                {title}
              </Text>
            ) : (
              <Skeleton size={SkeletonSize.lg} isDark />
            )}
          </CardBody>
        </Card>
      </a>
    </div>
  );
};

FirstPanelTile.propTypes = {
  id: PropTypes.string.isRequired,
  count: PropTypes.string,
  shape: PropTypes.shape({
    title: PropTypes.string.isRequired,
    href: PropTypes.string,
    section: PropTypes.string,
  }).isRequired,
  url: PropTypes.string,
};

export default FirstPanelTile;
