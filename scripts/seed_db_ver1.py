#!/usr/bin/env python3
"""
초기 데이터 삽입 스크립트
Mountain 커뮤니티 웹사이트의 기본 데이터를 생성합니다.
"""

import os
import sys
import mysql.connector
from mysql.connector import Error
import bcrypt
from datetime import datetime, timedelta
import random

# 현재 스크립트 경로를 기준으로 프로젝트 루트 경로 설정
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
sys.path.append(project_root)

# 데이터베이스 연결 설정
DB_CONFIG = {
    'host': 'localhost',
    'user': 'mountain_user',  # 실제 MySQL 사용자명으로 변경
    'password': '1111',  # 실제 MySQL 비밀번호로 변경
    'database': 'mountain_community'
}

def get_db_connection():
    """데이터베이스 연결을 반환합니다."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"데이터베이스 연결 오류: {e}")
        sys.exit(1)

def hash_password(password):
    """비밀번호를 해시화합니다."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_users(cursor):
    """기본 사용자를 생성합니다."""
    users = [
        ('admin', 'admin@example.com', hash_password('admin123'), 'admin'),
        ('moderator', 'moderator@example.com', hash_password('moderator123'), 'moderator'),
        ('user1', 'user1@example.com', hash_password('user123'), 'user'),
        ('user2', 'user2@example.com', hash_password('user123'), 'user'),
        ('user3', 'user3@example.com', hash_password('user123'), 'user')
    ]
    
    query = """
    INSERT INTO users (username, email, password_hash, role)
    VALUES (%s, %s, %s, %s)
    """
    
    for user in users:
        try:
            cursor.execute(query, user)
            print(f"사용자 생성: {user[0]}")
        except Error as e:
            if e.errno == 1062:  # 중복 키 오류
                print(f"사용자가 이미 존재합니다: {user[0]}")
            else:
                print(f"사용자 생성 오류: {e}")

def create_institutions(cursor):
    """기본 기관을 생성합니다."""
    institutions = [
        ('국회', '대한민국 국회'),
        ('여성가족부', '대한민국 여성가족부'),
        ('교육부', '대한민국 교육부'),
        ('고용노동부', '대한민국 고용노동부'),
        ('문화체육관광부', '대한민국 문화체육관광부')
    ]
    
    query = """
    INSERT INTO institutions (name, description)
    VALUES (%s, %s)
    """
    
    for institution in institutions:
        try:
            cursor.execute(query, institution)
            print(f"기관 생성: {institution[0]}")
        except Error as e:
            if e.errno == 1062:  # 중복 키 오류
                print(f"기관이 이미 존재합니다: {institution[0]}")
            else:
                print(f"기관 생성 오류: {e}")

def create_categories(cursor):
    """기본 카테고리를 생성합니다."""
    categories = [
        ('공지사항', '관리자가 작성한 공지사항'),
        ('자유게시판', '자유롭게 의견을 나누는 게시판'),
        ('질문과 답변', '질문하고 답변을 받는 게시판'),
        ('정보 공유', '유용한 정보를 공유하는 게시판'),
        ('건의사항', '사이트 운영에 관한 건의사항')
    ]
    
    query = """
    INSERT INTO categories (name, description)
    VALUES (%s, %s)
    """
    
    for category in categories:
        try:
            cursor.execute(query, category)
            print(f"카테고리 생성: {category[0]}")
        except Error as e:
            if e.errno == 1062:  # 중복 키 오류
                print(f"카테고리가 이미 존재합니다: {category[0]}")
            else:
                print(f"카테고리 생성 오류: {e}")

def create_settings(cursor):
    """기본 설정을 생성합니다."""
    settings = [
        ('report_threshold', '3', '게시물이 자동으로 숨겨지는 신고 횟수'),
        ('site_name', 'Mountain 커뮤니티', '사이트 이름'),
        ('posts_per_page', '50', '페이지당 게시물 수'),
        ('comments_per_page', '50', '페이지당 댓글 수'),
        ('allow_guest_view', 'true', '비로그인 사용자의 게시물 조회 허용')
    ]
    
    query = """
    INSERT INTO settings (key_name, value, description)
    VALUES (%s, %s, %s)
    """
    
    for setting in settings:
        try:
            cursor.execute(query, setting)
            print(f"설정 생성: {setting[0]}")
        except Error as e:
            if e.errno == 1062:  # 중복 키 오류
                print(f"설정이 이미 존재합니다: {setting[0]}")
            else:
                print(f"설정 생성 오류: {e}")

def create_sample_posts(cursor):
    """샘플 게시물을 생성합니다."""
    # 사용자 ID 가져오기
    cursor.execute("SELECT id FROM users")
    user_ids = [row[0] for row in cursor.fetchall()]
    
    # 기관 ID 가져오기
    cursor.execute("SELECT id FROM institutions")
    institution_ids = [row[0] for row in cursor.fetchall()]
    
    # 카테고리 ID 가져오기
    cursor.execute("SELECT id FROM categories")
    category_ids = [row[0] for row in cursor.fetchall()]
    
    # 샘플 게시물 생성
    sample_posts = [
        ('첫 번째 공지사항', '이것은 첫 번째 공지사항입니다.', 1, 1, 1),
        ('자유게시판 첫 글', '자유게시판에 오신 것을 환영합니다!', 3, None, 2),
        ('질문이 있습니다', '이 사이트는 어떻게 사용하나요?', 4, None, 3),
        ('유용한 정보 공유', '여기 유용한 정보가 있습니다.', 5, 2, 4),
        ('건의사항 있습니다', '사이트 개선을 위한 건의사항입니다.', 2, None, 5)
    ]
    
    query = """
    INSERT INTO posts (title, content, user_id, institution_id, category_id)
    VALUES (%s, %s, %s, %s, %s)
    """
    
    for post in sample_posts:
        try:
            cursor.execute(query, post)
            print(f"게시물 생성: {post[0]}")
        except Error as e:
            print(f"게시물 생성 오류: {e}")

def create_sample_comments(cursor):
    """샘플 댓글을 생성합니다."""
    # 사용자 ID 가져오기
    cursor.execute("SELECT id FROM users")
    user_ids = [row[0] for row in cursor.fetchall()]
    
    # 게시물 ID 가져오기
    cursor.execute("SELECT id FROM posts")
    post_ids = [row[0] for row in cursor.fetchall()]
    
    if not post_ids:
        print("댓글을 생성할 게시물이 없습니다.")
        return
    
    # 샘플 댓글 생성
    sample_comments = [
        ('예?', 2, post_ids[0], None),
        ('ㄱㅅ!', 1, post_ids[0], 1),
        ('환영', 3, post_ids[1], None),
        ('저도', 5, post_ids[2], None),
        ('답변됩니다.', 1, post_ids[2], 4),
        ('유용니다.', 4, post_ids[3], None),
        ('건검겠니다.', 1, post_ids[4], None)
    ]
    
    query = """
    INSERT INTO comments (content, user_id, post_id, parent_id)
    VALUES (%s, %s, %s, %s)
    """
    
    for comment in sample_comments:
        try:
            cursor.execute(query, comment)
            print(f"댓글 생성: {comment[0][:20]}...")
        except Error as e:
            print(f"댓글 생성 오류: {e}")

def create_sample_notices(cursor):
    """샘플 공지사항을 생성합니다."""
    # 관리자 ID 가져오기
    cursor.execute("SELECT id FROM users WHERE role = 'admin'")
    admin_ids = [row[0] for row in cursor.fetchall()]
    
    if not admin_ids:
        print("공지사항을 생성할 관리자가 없습니다.")
        return
    
    admin_id = admin_ids[0]
    
    # 샘플 공지사항 생성
    sample_notices = [
        ('사이트 오픈 안내', '안녕하세요. Mountain 오픈했.', admin_id, True),
        ('이용 규칙 안내', '커뮤니티 이용 규칙을 안내드립니다.', admin_id, False),
        ('업데이트 안내', '새로운 기능이 추가되었습니다.', admin_id, False)
    ]
    
    query = """
    INSERT INTO notices (title, content, user_id, is_important)
    VALUES (%s, %s, %s, %s)
    """
    
    for notice in sample_notices:
        try:
            cursor.execute(query, notice)
            print(f"공지사항 생성: {notice[0]}")
        except Error as e:
            print(f"공지사항 생성 오류: {e}")

def main():
    """메인 함수"""
    print("Mountain 커뮤니티 초기 데이터 생성을 시작합니다...")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 초기 데이터 생성
        create_users(cursor)
        create_institutions(cursor)
        create_categories(cursor)
        create_settings(cursor)
        create_sample_posts(cursor)
        create_sample_comments(cursor)
        create_sample_notices(cursor)
        
        # 변경사항 커밋
        conn.commit()
        print("초기 데이터 생성이 완료되었습니다.")
        
    except Error as e:
        print(f"오류 발생: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("데이터베이스 연결이 닫혔습니다.")

if __name__ == "__main__":
    main()