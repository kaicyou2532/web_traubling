-- Postテーブルの最大IDを確認
SELECT MAX(id) as max_id FROM "Post";

-- シーケンスの現在値を確認
SELECT last_value FROM "Post_id_seq";

-- シーケンスをリセット
SELECT setval('"Post_id_seq"', COALESCE(MAX(id), 0) + 1, false) FROM "Post";