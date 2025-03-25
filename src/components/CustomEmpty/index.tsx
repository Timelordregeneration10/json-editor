import React, { useMemo } from 'react';
import { Empty } from 'antd';
import type { EmptyProps } from 'antd/lib/empty';
import emptyImage from '@/assets/empty.svg';
import noDataImage from '@/assets/no_data.png';
import researchImage from '@/assets/research.svg';

interface CustomEmptyProps extends EmptyProps {
  type?: 'normal' | 'none' | 'research';
  size?: 'small' | 'default' | 'large';
}

const CustomEmpty: React.FC<CustomEmptyProps> = ({
  type = 'default',
  size = 'default',
  ...rest
}) => {
  const image = useMemo(() => {
    switch (type) {
      case 'default':
        return emptyImage;
      case 'none':
        return noDataImage;
      case 'research':
        return researchImage;
      default:
        break;
    }
  }, [type]);

  const imageStyle = useMemo(() => {
    switch (size) {
      case 'small':
        return { height: 40, margin: '10px auto' };
      case 'default':
        return { height: 60, margin: '20px auto' };
      case 'large':
        return { height: 150, margin: '40px auto' };
    }
  }, [size]);

  return (
    <Empty
      image={image}
      imageStyle={imageStyle}
      style={{
        padding: '10px 0',
        margin: '40px auto',
        color: '#475669',
        fontWeight: '500',
        fontSize: '14px',
      }}
      {...rest}
    />
  );
};

export default CustomEmpty;
