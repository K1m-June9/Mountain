# # test_models.py
# from backend.models import Base
# print(Base.metadata.tables)  # 이 출력에 테이블이 표시되어야 합니다

#!/usr/bin/env python3
"""
초기 데이터 삽입 스크립트
커뮤니티 웹사이트의 기본 데이터를 생성합니다.
"""

import os
import sys
import bcrypt
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session

# 현재 스크립트 경로를 기준으로 프로젝트 루트 경로 설정
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
sys.path.append(project_root)

from backend.database import SessionLocal, engine, Base
from backend.models.user import User
from backend.models.institution import Institution
from backend.models.category import Category
from backend.models.setting import Setting
from backend.models.post import Post, PostImage
from backend.models.comment import Comment
from backend.models.notice import Notice
from backend.models.reaction import Reaction
from backend.models.report import Report
from backend.models.notification import Notification
from backend.models.activity_log import ActivityLog
from backend.models.restriction_history import RestrictionHistory

def hash_password(password):
    """비밀번호를 해시화합니다."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_users(db: Session):
    """기본 사용자를 생성합니다."""
    users = [
        User(username='admin', email='admin@example.com', password_hash=hash_password('admin123'), role='admin'),
        User(username='moderator', email='moderator@example.com', password_hash=hash_password('moderator123'), role='moderator'),
        User(username='user1', email='user1@example.com', password_hash=hash_password('user123'), role='user'),
        User(username='user2', email='user2@example.com', password_hash=hash_password('user123'), role='user'),
        User(username='user3', email='user3@example.com', password_hash=hash_password('user123'), role='user')
    ]
    
    for user in users:
        existing_user = db.query(User).filter(User.username == user.username).first()
        if not existing_user:
            db.add(user)
            print(f"사용자 생성: {user.username}")
        else:
            print(f"사용자가 이미 존재합니다: {user.username}")
    
    db.commit()
    return db.query(User).all()

def create_institutions(db: Session):
    """기본 기관을 생성합니다."""
    institutions = [
        Institution(name='국회', description='대한민국 국회'),
        Institution(name='여성가족부', description='대한민국 여성가족부'),
        Institution(name='교육부', description='대한민국 교육부'),
        Institution(name='고용노동부', description='대한민국 고용노동부'),
        Institution(name='문화체육관광부', description='대한민국 문화체육관광부')
    ]
    
    for institution in institutions:
        existing_institution = db.query(Institution).filter(Institution.name == institution.name).first()
        if not existing_institution:
            db.add(institution)
            print(f"기관 생성: {institution.name}")
        else:
            print(f"기관이 이미 존재합니다: {institution.name}")
    
    db.commit()
    return db.query(Institution).all()

def create_categories(db: Session):
    """기본 카테고리를 생성합니다."""
    categories = [
        Category(name='공지사항', description='관리자가 작성한 공지사항'),
        Category(name='자유게시판', description='자유롭게 의견을 나누는 게시판'),
        Category(name='질문과 답변', description='질문하고 답변을 받는 게시판'),
        Category(name='정보 공유', description='유용한 정보를 공유하는 게시판'),
        Category(name='건의사항', description='사이트 운영에 관한 건의사항')
    ]
    
    for category in categories:
        existing_category = db.query(Category).filter(Category.name == category.name).first()
        if not existing_category:
            db.add(category)
            print(f"카테고리 생성: {category.name}")
        else:
            print(f"카테고리가 이미 존재합니다: {category.name}")
    
    db.commit()
    return db.query(Category).all()

def create_settings(db: Session):
    """기본 설정을 생성합니다."""
    settings = [
        Setting(key_name='report_threshold', value='3', description='게시물이 자동으로 숨겨지는 신고 횟수'),
        Setting(key_name='site_name', value='커뮤니티', description='사이트 이름'),
        Setting(key_name='posts_per_page', value='50', description='페이지당 게시물 수'),
        Setting(key_name='comments_per_page', value='50', description='페이지당 댓글 수'),
        Setting(key_name='allow_guest_view', value='true', description='비로그인 사용자의 게시물 조회 허용')
    ]
    
    for setting in settings:
        existing_setting = db.query(Setting).filter(Setting.key_name == setting.key_name).first()
        if not existing_setting:
            db.add(setting)
            print(f"설정 생성: {setting.key_name}")
        else:
            print(f"설정이 이미 존재합니다: {setting.key_name}")
    
    db.commit()

def create_sample_posts(db: Session, users, institutions, categories):
    """샘플 게시물을 생성합니다."""
    sample_posts = [
        Post(
            title='첫 번째 공지사항', 
            content='이것은 첫 번째 공지사항입니다.', 
            user_id=users[0].id, 
            institution_id=institutions[0].id, 
            category_id=categories[0].id
        ),
        Post(
            title='자유게시판 첫 글', 
            content='자유게시판에 오신 것을 환영합니다!', 
            user_id=users[2].id, 
            category_id=categories[1].id
        ),
        Post(
            title='질문이 있습니다', 
            content='이 사이트는 어떻게 사용하나요?', 
            user_id=users[3].id, 
            category_id=categories[2].id
        ),
        Post(
            title='유용한 정보 공유', 
            content='여기 유용한 정보가 있습니다.', 
            user_id=users[4].id, 
            institution_id=institutions[1].id, 
            category_id=categories[3].id
        ),
        Post(
            title='건의사항 있습니다', 
            content='사이트 개선을 위한 건의사항입니다.', 
            user_id=users[1].id, 
            category_id=categories[4].id
        )
    ]
    
    for post in sample_posts:
        db.add(post)
        print(f"게시물 생성: {post.title}")
    
    db.commit()
    return db.query(Post).all()

def create_sample_comments(db: Session, users, posts):
    """샘플 댓글을 생성합니다."""
    if not posts:
        print("댓글을 생성할 게시물이 없습니다.")
        return []
    
    # 첫 번째 댓글 생성
    comment1 = Comment(
        content='첫 번째 댓글입니다.',
        user_id=users[1].id,
        post_id=posts[0].id
    )
    db.add(comment1)
    db.flush()  # ID를 얻기 위해 flush
    
    # 첫 번째 댓글에 대한 답글
    comment2 = Comment(
        content='첫 번째 댓글에 대한 답글입니다.',
        user_id=users[0].id,
        post_id=posts[0].id,
        parent_id=comment1.id
    )
    db.add(comment2)
    
    # 다른 게시물에 대한 댓글들
    sample_comments = [
        Comment(content='환영합니다!', user_id=users[2].id, post_id=posts[1].id),
        Comment(content='저도 같은 질문이 있었어요.', user_id=users[4].id, post_id=posts[2].id),
        Comment(content='질문에 대한 답변입니다.', user_id=users[0].id, post_id=posts[2].id),
        Comment(content='정말 유용한 정보네요.', user_id=users[3].id, post_id=posts[3].id),
        Comment(content='건의사항 검토하겠습니다.', user_id=users[0].id, post_id=posts[4].id)
    ]
    
    for comment in sample_comments:
        db.add(comment)
        print(f"댓글 생성: {comment.content[:20]}...")
    
    db.commit()
    return db.query(Comment).all()

def create_sample_notices(db: Session, users):
    """샘플 공지사항을 생성합니다."""
    admin_users = [user for user in users if user.role == 'admin']
    
    if not admin_users:
        print("공지사항을 생성할 관리자가 없습니다.")
        return []
    
    admin_user = admin_users[0]
    
    sample_notices = [
        Notice(
            title='사이트 오픈 안내', 
            content='안녕하세요. 커뮤니티가 오픈했습니다.', 
            user_id=admin_user.id, 
            is_important=True
        ),
        Notice(
            title='이용 규칙 안내', 
            content='커뮤니티 이용 규칙을 안내드립니다.', 
            user_id=admin_user.id, 
            is_important=False
        ),
        Notice(
            title='업데이트 안내', 
            content='새로운 기능이 추가되었습니다.', 
            user_id=admin_user.id, 
            is_important=False
        )
    ]
    
    for notice in sample_notices:
        db.add(notice)
        print(f"공지사항 생성: {notice.title}")
    
    db.commit()
    return db.query(Notice).all()

def create_sample_reactions(db: Session, users, posts, comments):
    """샘플 반응(좋아요/싫어요)을 생성합니다."""
    # 게시물에 대한 반응
    post_reactions = [
        {"user_id": users[1].id, "post_id": posts[0].id, "type": 'like'},
        {"user_id": users[2].id, "post_id": posts[0].id, "type": 'like'},
        {"user_id": users[3].id, "post_id": posts[0].id, "type": 'dislike'},
        {"user_id": users[0].id, "post_id": posts[1].id, "type": 'like'},
        {"user_id": users[4].id, "post_id": posts[2].id, "type": 'like'}
    ]
    
    # 댓글에 대한 반응
    comment_reactions = [
        {"user_id": users[0].id, "comment_id": comments[0].id, "type": 'like'},
        {"user_id": users[2].id, "comment_id": comments[1].id, "type": 'like'},
        {"user_id": users[3].id, "comment_id": comments[2].id, "type": 'dislike'}
    ]
    
    post_reaction_count = 0
    comment_reaction_count = 0
    
    # 게시물 반응 추가
    for reaction_data in post_reactions:
        # 이미 존재하는 반응인지 확인
        existing_reaction = db.query(Reaction).filter(
            Reaction.user_id == reaction_data["user_id"],
            Reaction.post_id == reaction_data["post_id"],
            Reaction.type == reaction_data["type"]
        ).first()
        
        if not existing_reaction:
            reaction = Reaction(**reaction_data)
            db.add(reaction)
            post_reaction_count += 1
    
    # 댓글 반응 추가
    for reaction_data in comment_reactions:
        # 이미 존재하는 반응인지 확인
        existing_reaction = db.query(Reaction).filter(
            Reaction.user_id == reaction_data["user_id"],
            Reaction.comment_id == reaction_data["comment_id"],
            Reaction.type == reaction_data["type"]
        ).first()
        
        if not existing_reaction:
            reaction = Reaction(**reaction_data)
            db.add(reaction)
            comment_reaction_count += 1
    
    try:
        db.commit()
        print(f"반응 생성: {post_reaction_count} 게시물 반응, {comment_reaction_count} 댓글 반응")
    except Exception as e:
        db.rollback()
        print(f"반응 생성 중 오류 발생: {e}")

def create_sample_reports(db: Session, users, posts, comments):
    """샘플 신고를 생성합니다."""
    # 게시물 신고
    post_reports = [
        Report(
            reporter_id=users[1].id,
            post_id=posts[3].id,
            reason='부적절한 내용',
            description='이 게시물은 부적절한 내용을 포함하고 있습니다.',
            status='pending'
        ),
        Report(
            reporter_id=users[2].id,
            post_id=posts[3].id,
            reason='스팸',
            description='이 게시물은 스팸입니다.',
            status='pending'
        )
    ]
    
    # 댓글 신고
    comment_reports = [
        Report(
            reporter_id=users[3].id,
            comment_id=comments[2].id,
            reason='불쾌한 표현',
            description='이 댓글은 불쾌한 표현을 포함하고 있습니다.',
            status='pending'
        )
    ]
    
    for report in post_reports + comment_reports:
        db.add(report)
    
    db.commit()
    print(f"신고 생성: {len(post_reports)} 게시물 신고, {len(comment_reports)} 댓글 신고")

def create_sample_notifications(db: Session, users):
    """샘플 알림을 생성합니다."""
    sample_notifications = [
        Notification(
            user_id=users[1].id,
            type='admin_message',
            content='관리자로부터의 메시지: 환영합니다!',
            is_read=False
        ),
        Notification(
            user_id=users[2].id,
            type='report_status',
            content='귀하의 신고가 처리되었습니다.',
            is_read=True,
            related_id=1
        )
    ]
    
    for notification in sample_notifications:
        db.add(notification)
    
    db.commit()
    print(f"알림 생성: {len(sample_notifications)} 알림")

def create_sample_activity_logs(db: Session, users):
    """샘플 활동 로그를 생성합니다."""
    sample_logs = [
        ActivityLog(
            user_id=users[0].id,
            action_type='login',
            description='관리자 로그인',
            ip_address='127.0.0.1'
        ),
        ActivityLog(
            user_id=users[1].id,
            action_type='post_create',
            description='게시물 생성',
            ip_address='127.0.0.1'
        ),
        ActivityLog(
            user_id=users[2].id,
            action_type='comment_create',
            description='댓글 작성',
            ip_address='127.0.0.1'
        )
    ]
    
    for log in sample_logs:
        db.add(log)
    
    db.commit()
    print(f"활동 로그 생성: {len(sample_logs)} 로그")

def create_sample_post_images(db: Session, posts):
    """샘플 게시물 이미지를 생성합니다."""
    sample_images = [
        PostImage(
            post_id=posts[0].id,
            image_url='https://example.com/images/sample1.jpg'
        ),
        PostImage(
            post_id=posts[3].id,
            image_url='https://example.com/images/sample2.jpg'
        )
    ]
    
    for image in sample_images:
        db.add(image)
    
    db.commit()
    print(f"게시물 이미지 생성: {len(sample_images)} 이미지")

def create_sample_restriction_history(db: Session, users):
    """샘플 제한 이력을 생성합니다."""
    # 일시 정지 사용자 생성
    suspended_user = User(
        username='suspended_user',
        email='suspended@example.com',
        password_hash=hash_password('user123'),
        role='user',
        status='suspended',
        suspended_until=datetime.now() + timedelta(days=7)
    )
    db.add(suspended_user)
    db.flush()
    
    # 제한 이력 생성
    restriction = RestrictionHistory(
        user_id=suspended_user.id,
        type='suspend',
        reason='커뮤니티 규칙 위반',
        duration=7,  # 7일
        suspended_until=suspended_user.suspended_until,
        created_by=users[0].id  # 관리자가 제한
    )
    db.add(restriction)
    
    db.commit()
    print(f"제한 이력 생성: 사용자 {suspended_user.username}에 대한 제한")

def main():
    """메인 함수"""
    print("커뮤니티 초기 데이터 생성을 시작합니다...")
    
    # 데이터베이스 세션 생성
    db = SessionLocal()
    
    try:
        # 초기 데이터 생성
        users = create_users(db)
        institutions = create_institutions(db)
        categories = create_categories(db)
        create_settings(db)
        posts = create_sample_posts(db, users, institutions, categories)
        comments = create_sample_comments(db, users, posts)
        create_sample_notices(db, users)
        create_sample_reactions(db, users, posts, comments)
        create_sample_reports(db, users, posts, comments)
        create_sample_notifications(db, users)
        create_sample_activity_logs(db, users)
        create_sample_post_images(db, posts)
        create_sample_restriction_history(db, users)
        
        print("초기 데이터 생성이 완료되었습니다.")
        
    except Exception as e:
        db.rollback()
        print(f"오류 발생: {e}")
    finally:
        db.close()
        print("데이터베이스 연결이 닫혔습니다.")

if __name__ == "__main__":
    main()