import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.section}>
      <div className={styles.container2}>
        <p className={styles.text}>文案创作</p>
        <div className={styles.container}>
          <div className={styles.button}>
            <p className={styles.text2}>撤销</p>
          </div>
          <div className={styles.button}>
            <p className={styles.text2}>重做</p>
          </div>
          <div className={styles.button}>
            <p className={styles.text2}>配音格式化</p>
          </div>
          <div className={styles.button}>
            <p className={styles.text2}>导出文本</p>
          </div>
          <div className={styles.button}>
            <p className={styles.text2}>转到配音</p>
          </div>
          <div className={styles.button}>
            <p className={styles.text2}>转到项目</p>
          </div>
        </div>
      </div>
      <div className={styles.container5}>
        <div className={styles.container3}>
          <p className={styles.text3}>主文案</p>
        </div>
        <div className={styles.button2}>
          <img src="../image/mi1mwqeo-qu9i0ih.svg" className={styles.container4} />
        </div>
      </div>
      <div className={styles.textarea}>
        <div className={styles.container6}>
          <p className={styles.aJustLaunchedTheUlti}>
            🚀 Just launched the ultimate tool for creators! 🎬
            <br />
            Say goodbye to writer's block and hello to endless inspiration. Our new
            app helps you <br />
            craft compelling video scripts in minutes.
            <br />
            Ready to level up your content? 🔥 #VideoEditing #CreativeTools
            #ContentCreation
          </p>
        </div>
        <p className={styles.text4}>198 字符</p>
      </div>
    </div>
  );
}

export default Component;
