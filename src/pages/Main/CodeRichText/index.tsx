import React, { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import './index.less';
import { linter, Diagnostic, lintGutter } from '@codemirror/lint';

// JSON Linter 函数
const jsonLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  const text = view.state.doc.toString();
  try {
    JSON.parse(text);
  } catch (e: any) {
    if (e.message) {
      // 从 jsonlint 错误消息中提取行列信息
      const match = /line (\d+) column (\d+)/.exec(e.message);
      if (match) {
        const line = parseInt(match[1]);
        const column = parseInt(match[2]);
        // 确保行在有效范围内
        if (line <= view.state.doc.lines) {
          const lineObj = view.state.doc.line(line);
          diagnostics.push({
            from: lineObj.from + Math.min(column - 1, lineObj.length),
            to: lineObj.from + Math.min(column, lineObj.length),
            severity: 'error',
            message: e.message,
          });
        } else {
          // 如果无法精确定位，则使用全文范围
          diagnostics.push({
            from: 0,
            to: text.length,
            severity: 'error',
            message: e.message,
          });
        }
      } else {
        // 如果无法解析错误位置，则使用全文范围
        diagnostics.push({
          from: 0,
          to: text.length,
          severity: 'error',
          message: e.message,
        });
      }
    }
  }
  return diagnostics;
});

interface CodeRichTextProps {
  code: string | undefined;
  setCode?: (code: string) => void;
  editing?: boolean;
  contentStyle?: React.CSSProperties;
}

const CodeRichText: React.FC<CodeRichTextProps> = ({ code = '', setCode, editing = true, contentStyle = {} }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<EditorView | null>(null);
  const setCodeInstance = useRef<((code: string) => void) | null>(null);

  useEffect(() => {
    if (setCode) setCodeInstance.current = setCode;
  }, [setCode]);

  useEffect(() => {
    const updateListener = (v: ViewUpdate) => {
      if (v.docChanged) {
        const newCode = v.state.doc.toString();
        setCodeInstance.current && setCodeInstance.current(newCode);
      }
    }
    const newState = {
      doc: code,
      extensions: [
        basicSetup,
        // ...theme,
        json(),
        lintGutter(), // 添加 lint gutter 显示错误标记
        jsonLinter, // 添加自定义的 JSON linter
        EditorView.updateListener.of(updateListener),
        EditorState.readOnly.of(false),
      ],
    };
    if (!editorInstance.current) {
      const state = EditorState.create(newState);
      editorInstance.current = new EditorView({
        state,
        parent: editorRef.current as any,
      });
    } else {
      // 如果正在编辑右侧json代码，则会自动更新state
      if (editing) return;
      // 如果正在编辑左侧form区域，则需要手动更新state
      const state = EditorState.create(newState);
      editorInstance.current.setState(state);
    }
  }, [code]);

  return (
    <div className="field-code-input">
      <div ref={editorRef} className="field-code-input-body" style={contentStyle} />
    </div>
  );
};

export default CodeRichText;
