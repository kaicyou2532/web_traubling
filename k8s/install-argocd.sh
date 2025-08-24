#!/bin/bash

# ArgoCD インストールスクリプト

set -e

echo "ArgoCD をインストールしています..."

# ArgoCD 名前空間を作成
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# ArgoCD をインストール
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "ArgoCD のインストールが完了しました。"
echo ""

# ArgoCD サーバーの起動を待機
echo "ArgoCD サーバーの起動を待機しています..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

echo "ArgoCD サーバーが起動しました。"
echo ""

# ArgoCD の初期パスワードを取得
echo "ArgoCD の初期パスワードを取得しています..."
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

echo ""
echo "=========================="
echo "ArgoCD のセットアップ完了"
echo "=========================="
echo ""
echo "ArgoCD UI にアクセスするためのポートフォワーディングを開始:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo ""
echo "ログイン情報:"
echo "  URL: https://localhost:8080"
echo "  ユーザー名: admin"
echo "  パスワード: $ARGOCD_PASSWORD"
echo ""
echo "注意: パスワードは初回ログイン後に変更することを推奨します。"
echo ""

# ポートフォワーディングを開始するかユーザーに確認
read -p "今すぐポートフォワーディングを開始しますか？ (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "ポートフォワーディングを開始しています..."
    echo "Ctrl+C で停止できます。"
    kubectl port-forward svc/argocd-server -n argocd 8080:443
fi
