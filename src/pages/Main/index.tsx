import { PageContainer, ProCard, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Button, Cascader, Input, message, Popconfirm, Space, Tooltip } from 'antd';
import './index.less';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CodeRichText from './CodeRichText';
import ResizeQueryFilter from '@/components/ResizeQueryFilter';
import {
  DeleteOutlined,
  PlusCircleFilled,
  PlusCircleOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import CustomEmpty from '@/components/CustomEmpty';
import { debounce } from 'lodash';
import useWindow from '@/utils/useWindow';
import rmt from './assets/rmt.gif';
import { Helmet } from '@umijs/max';

const JsonEditor = () => {
  const defaultJson: any = useMemo(
    () => ({
      property1: '',
      property2: 0,
      property3: [],
      property4: {
        sub1: '',
        sub2: 0,
      },
      property5: [
        {
          sub3: '',
          sub4: 0,
          sub5: [''],
        },
        {
          sub3: '',
          sub4: 0,
          sub5: {},
          sub6: [0],
        },
      ],
    }),
    [],
  );
  const [data, setData] = useState<string>(JSON.stringify(defaultJson, null, 2));
  const [editing, setEditing] = useState<boolean>(false);
  const [proportyName, setProportyName] = useState<string>('');
  const [addType, setAddType] = useState<string[]>(['basic-string']);

  const setCode = debounce((code: string) => {
    setData(code);
  }, 100);

  const handleUploadJson = async () => {
    // 动态创建 <input type="file"> 元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // 仅接受 JSON 文件
    // 绑定文件选择后的处理逻辑
    input.addEventListener('change', async (e) => {
      if (!e.target) return;
      const eTarget = e.target as HTMLInputElement;
      if (!eTarget.files) return;
      const file = eTarget.files[0];
      if (!file) {
        message.error('请选择一个文件！');
        return;
      }
      // 文件类型检查
      if (file.type !== 'application/json') {
        message.error('文件类型错误！请确保选择的文件为 JSON 格式。');
        return;
      }
      // 读取文件内容
      const reader = new FileReader();
      reader.readAsText(file);
      try {
        // 等待文件读取完成
        await new Promise((resolve, reject) => {
          reader.onload = resolve;
          reader.onerror = reject;
        });
        if (typeof reader.result === 'string') {
          const jsonData = JSON.parse(reader.result);
          if (typeof jsonData === 'object') {
            setData(JSON.stringify(jsonData, null, 2));
          } else {
            message.error('JSON 格式错误！请检查文件内容。');
          }
        }
      } catch (error) {
        console.error('文件解析失败:', error);
        message.error('JSON 格式错误！请检查文件内容。');
      } finally {
        input.remove();
      }
    });
    input.click();
  };

  const handleAdd = useCallback((addPosition: string[]) => {
    if (proportyName === '') {
      message.error('属性名不能为空');
      return;
    }
    setData((dat) => {
      const tempData = JSON.parse(dat);
      let addThing: any;
      switch (addType.join('-')) {
        case 'basic-string':
          addThing = '';
          break;
        case 'basic-number':
          addThing = 0;
          break;
        case 'object':
          addThing = {};
          break;
        case 'basic-array-string':
          addThing = [];
          break;
        case 'basic-array-number':
          addThing = [0];
          break;
        case 'object-array':
          addThing = [{}];
          break;
        default:
          addThing = '';
          break;
      }
      addPosition.reduce((acc, cur) => acc[cur], tempData)[proportyName] = addThing;
      return JSON.stringify(tempData, null, 2);
    });
    setAddType(['basic-string']);
    setProportyName('');
  }, [addType, proportyName]);

  const renderJSON = useCallback((json: any, currentPlace: string[]) => {
    // 遍历json
    const children = Object.keys(json).map((key) => {
      const value = json[key];
      // value是对象或者数组
      if (typeof value === 'object') {
        // value是对象则继续递归
        if (!Array.isArray(value)) {
          return renderJSON(value, [...currentPlace, key]);
        }
        // value是数组
        else {
          // 数组的元素是对象
          if (value.length > 0 && typeof value[0] === 'object') {
            return (
              <ProCard
                title={
                  <div className="arrayObjHeader">
                    {key}
                    <div>
                      <Tooltip title="新增属性">
                        <Button
                          type="link"
                          icon={<PlusCircleOutlined />}
                          onClick={() => {
                            setData((dat) => {
                              const tempData = JSON.parse(dat);
                              currentPlace.reduce((acc, cur) => acc[cur], tempData)[key] = [
                                ...value,
                                {},
                              ];
                              return JSON.stringify(tempData, null, 2);
                            });
                          }}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="确认删除？"
                        okText="是"
                        cancelText="否"
                        onConfirm={() => {
                          setData((dat) => {
                            const tempData = JSON.parse(dat);
                            delete currentPlace.reduce((acc, cur) => acc[cur], tempData)[key];
                            return JSON.stringify(tempData, null, 2);
                          });
                        }}
                      >
                        <Tooltip title="删除属性">
                          <Button danger type="link" icon={<DeleteOutlined />} />
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  </div>
                }
                bordered
                key={currentPlace.join(' -> ')}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                }}
                headStyle={{ padding: '12px 12px 0px 12px' }}
              >
                {value.map((item, index) => {
                  return renderJSON(item, [...currentPlace, key, index.toString()]);
                })}
              </ProCard>
            );
          }
          // 数组元素不是对象
          else {
            return (
              <div className="arrayObjItem ant-form-item-width100" key={[...currentPlace, key].join(' -> ')}>
                <ProFormSelect
                  key={[...currentPlace, key, "select"].join(' -> ')}
                  name={[...currentPlace, key].join(' -> ')}
                  label={key}
                  fieldProps={{
                    onChange: (e: any) => {
                      setData((dat) => {
                        const tempData = JSON.parse(dat);
                        let arrayType = 'string';
                        if (value.length > 0) {
                          arrayType = typeof value[0];
                        }
                        currentPlace.reduce((acc, cur) => acc[cur], tempData)[key] =
                          arrayType === 'number' ? e.map((item: string) => Number(item)) : e;
                        return JSON.stringify(tempData, null, 2);
                      });
                    },
                    value
                  }}
                  mode="tags"
                />
                <Popconfirm
                  title="确认删除？"
                  okText="是"
                  cancelText="否"
                  onConfirm={() => {
                    setData((dat) => {
                      const tempData = JSON.parse(dat);
                      delete currentPlace.reduce((acc, cur) => acc[cur], tempData)[key];
                      return JSON.stringify(tempData, null, 2);
                    });
                  }}
                >
                  <Tooltip title="删除属性">
                    <Button danger type="link" icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </div>
            );
          }
        }
      }
      // value是基本类型
      else {
        return (
          <div
            className="arrayObjItem ant-form-item-width100"
            key={[...currentPlace, key].join(' -> ')}
          >
            <ProFormText
              name={[...currentPlace, key].join(' -> ')}
              key={[...currentPlace, key, "text"].join(' -> ')}
              label={key}
              fieldProps={{
                onChange: (e) => {
                  setData((dat) => {
                    const tempData = JSON.parse(dat);
                    currentPlace.reduce((acc, cur) => acc[cur], tempData)[key] =
                      e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                    return JSON.stringify(tempData, null, 2);
                  });
                },
                type: typeof value === 'number' ? 'number' : 'text',
                value
              }}
            />
            <Popconfirm
              title="确认删除？"
              okText="是"
              cancelText="否"
              onConfirm={() => {
                setData((dat) => {
                  const tempData = JSON.parse(dat);
                  delete currentPlace.reduce((acc, cur) => acc[cur], tempData)[key];
                  return JSON.stringify(tempData, null, 2);
                });
              }}
            >
              <Tooltip title="删除属性">
                <Button danger type="link" icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      }
    });
    return (
      <ProCard
        title={
          <div className="arrayObjHeader">
            {currentPlace.length >= 1 ? currentPlace[currentPlace.length - 1] : 'Root'}
            <div>
              <Popconfirm
                title={
                  <div>
                    <div
                      style={{
                        color: '#1890ff',
                        padding: '4px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      新增属性
                    </div>
                    <Space>
                      <Space.Compact>
                        <Input
                          placeholder="属性名称"
                          value={proportyName}
                          onChange={(e) => {
                            setProportyName(e.target.value);
                          }}
                        />
                        <Cascader
                          placeholder="属性类型"
                          options={[
                            {
                              label: '文本类型',
                              value: 'basic-string',
                            },
                            {
                              label: '数字类型',
                              value: 'basic-number',
                            },
                            {
                              label: '对象类型',
                              value: 'object',
                            },
                            {
                              label: '基本数组类型',
                              value: 'basic-array',
                              children: [
                                {
                                  label: '文本类型',
                                  value: 'string',
                                },
                                {
                                  label: '数字类型',
                                  value: 'number',
                                },
                              ],
                            },
                            {
                              label: '对象数组类型',
                              value: 'object-array',
                            },
                          ]}
                          value={addType}
                          onChange={(e) => {
                            setAddType(e as string[]);
                          }}
                        />
                      </Space.Compact>
                    </Space>
                  </div>
                }
                onConfirm={() => {
                  handleAdd([...currentPlace]);
                }}
                icon={false}
                onCancel={() => {
                  setProportyName('');
                  setAddType(['basic-string']);
                }}
                okText="确认"
                cancelText="取消"
              >
                <Tooltip title="新增属性">
                  <Button type="link" icon={<PlusCircleOutlined />} />
                </Tooltip>
              </Popconfirm>
              {currentPlace.length >= 1 && (
                <Popconfirm
                  title="确认删除？"
                  okText="是"
                  cancelText="否"
                  onConfirm={() => {
                    setData((dat) => {
                      const tempData = JSON.parse(dat);
                      if (!Number.isNaN(Number(currentPlace.slice(-1)[0]))) {
                        currentPlace
                          .slice(0, -1)
                          .reduce((acc, cur) => acc[cur], tempData)
                          .splice(Number(currentPlace.slice(-1)[0]), 1);
                      } else {
                        delete currentPlace.slice(0, -1).reduce((acc, cur) => acc[cur], tempData)[
                          currentPlace.slice(-1)[0]
                        ];
                      }
                      return JSON.stringify(tempData, null, 2);
                    });
                  }}
                >
                  <Tooltip title="删除属性">
                    <Button danger type="link" icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
          </div>
        }
        bordered={currentPlace.length != 0}
        ghost={currentPlace.length === 0}
        key={currentPlace.join(' -> ')}
        bodyStyle={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}
        headStyle={{ padding: '12px 12px 0px 12px' }}
      >
        {children.length === 0 ? (
          <CustomEmpty
            size="small"
            style={{
              padding: '0 0',
              margin: '0 auto',
              color: '#475669',
              fontWeight: '500',
              fontSize: '14px',
            }}
          />
        ) : (
          children
        )}
      </ProCard>
    );
  },
    [proportyName, addType, handleAdd],
  );

  const [errorMsg, setErrorMsg] = useState<string>('');
  const hasError = useMemo(() => {
    try {
      JSON.parse(data);
    } catch (e: any) {
      setErrorMsg(JSON.stringify(e.message));
      return true;
    }
    return false;
  }, [data]);

  useEffect(() => {
    const localJson = localStorage.getItem('kilala-json');
    if (localJson) {
      const jsonData = JSON.parse(localJson);
      setData(() => {
        return JSON.stringify(jsonData, null, 2);
      });
    }
  }, []);

  const handleSaveJson = useCallback(async () => {
    try {
      localStorage.setItem("kilala-json", data);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  }, [data]);

  const codeElement = useMemo(() => {
    return <CodeRichText code={data} setCode={setCode} editing={editing} />
  }, [data, editing]);

  const { width } = useWindow();
  const [loadingPoint, setLoadingPoint] = useState(".");
  useEffect(() => {
    let interv: any = setInterval(() => {
      setLoadingPoint((p) => {
        return ".".repeat(p.length % 3 + 1)
      })
    }, 300);
    return () => {
      clearInterval(interv);
      interv = null;
    }
  }, []);
  const [point, setPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setPoint({ x: e.clientX, y: e.clientY });
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [])

  return (
    <PageContainer pageHeaderRender={false}>
      <Helmet>
        <link rel="icon" href="https://timelordregeneration10.github.io/json-editor/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="https://timelordregeneration10.github.io/json-editor/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="https://timelordregeneration10.github.io/json-editor/favicon.ico" />
      </Helmet>
      <ProCard
        title={
          <div
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
            onMouseEnter={() => { setEditing(false) }}
            onMouseMove={() => { setEditing(false) }}
          >
            <div style={{ color: '#1890ff', fontWeight: 700, fontSize: '18px' }}>
              Kilala Json Editor
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Tooltip title="本地上传JSON">
                <Button
                  type="link"
                  className="svg100"
                  onClick={handleUploadJson}
                  icon={<UploadOutlined />}
                />
              </Tooltip>
              <Tooltip title="保存JSON">
                <Button
                  type="link"
                  className="svg100"
                  onClick={handleSaveJson}
                  icon={<SaveOutlined />}
                />
              </Tooltip>
            </div>
          </div>
        }
        className="ant-pro-card-title-width100"
        bodyStyle={{ height: 'calc(100vh - 120px)', flexDirection: width < 768 ? "column" : "row" }}
        bordered
        gutter={24}
      >
        <ProCard
          title={<div style={{ fontWeight: 'bold', color: '#1890ff' }}>Form - Edit</div>}
          bordered
          colSpan={width < 768 ? '100%' : '50%'}
          bodyStyle={{ height: '100%', overflow: 'auto', padding: "0px" }}
          headStyle={{ borderBottom: '1px solid #00000015', paddingBottom: '8px' }}
          className="ant-pro-card-border-height100"
          onClick={() => { setEditing(false) }}
        >
          {hasError ? (
            <div className="error">
              <PlusCircleFilled
                style={{ color: 'rgba(255,0,0,0.6)', transform: 'rotate(45deg)' }}
              />
              <span style={{ fontWeight: 450 }}> Error</span>
              <br />
              {errorMsg}
            </div>
          ) : (
            <ResizeQueryFilter
              labelWidth="auto"
              submitter={false}
              className="ant-form-item-mb-smaller antd50to100"
            >
              {renderJSON(JSON.parse(data), [])}
            </ResizeQueryFilter>
          )}
        </ProCard>
        <ProCard
          title={<div style={{ fontWeight: 'bold', color: '#1890ff' }}>Code - Edit</div>}
          bordered
          colSpan={width < 768 ? '100%' : '50%'}
          headStyle={{ borderBottom: '1px solid #00000015', paddingBottom: '8px' }}
          bodyStyle={{ height: '100%', overflow: 'auto' }}
          className="ant-pro-card-border-height100"
          onClick={() => { setEditing(true) }}
        >
          {codeElement}
        </ProCard>
      </ProCard>
      <div className='RemCursorDiv' style={{ transform: `translate(${point.x}px,${point.y}px)` }}>
        <img src={rmt} className='RemCursor' />
        <span className='RemCursorText'>{editing ? ": code editing" : ": form editing"}{loadingPoint}</span>
      </div>
    </PageContainer>
  );
};

export default JsonEditor;
