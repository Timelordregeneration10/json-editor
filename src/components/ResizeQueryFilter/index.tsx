import React, { useCallback, useState, useMemo } from 'react';
import RcResizeObserver from 'rc-resize-observer';
import { QueryFilter } from '@ant-design/pro-components';
import type { QueryFilterProps } from '@ant-design/pro-components';
import { throttle } from 'lodash';

export type ResizeQueryFilterProps = QueryFilterProps & {
  // 可自定义不同尺寸下的列数
  colSpans?: {
    sm?: number; // < 768px
    md?: number; // 768px - 1080px
    lg?: number; // 1080px - 1280px
    xl?: number; // > 1280px
  };
};

const ResizeQueryFilter: React.FC<ResizeQueryFilterProps> = ({
  children,
  colSpans = {},
  ...rest
}) => {
  const [formSpan, setFormSpan] = useState<number>(6);
  const ColSpanMap = useMemo(
    () => ({
      sm: colSpans.sm || 24,
      md: colSpans.md || 12,
      lg: colSpans.lg || 8,
      xl: colSpans.xl || 6,
    }),
    [colSpans],
  );

  const onResize = useCallback(
    throttle(({ width }) => {
      if (width > 1280) {
        setFormSpan(ColSpanMap.xl);
      } else if (width > 1080) {
        setFormSpan(ColSpanMap.lg);
      } else if (width > 768) {
        setFormSpan(ColSpanMap.md);
      } else {
        setFormSpan(ColSpanMap.sm);
      }
    }, 100),
    [], // 添加 setFormSpan 到依赖项数组
  );

  return (
    <RcResizeObserver key="resize-observer" onResize={onResize}>
      <QueryFilter span={formSpan} style={{ marginBottom: -24 }} {...rest}>
        {children}
      </QueryFilter>
    </RcResizeObserver>
  );
};

export default ResizeQueryFilter;
